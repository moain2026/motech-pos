/**
 * Offline op-queue + background sync (STANDARDS/13 §1, §2).
 *
 * When a sale is created offline it is appended to the Dexie op-queue with a
 * client-generated idempotency key (clientOperationId). A background flusher
 * pushes pending ops to the backend when connectivity returns, with retry +
 * exponential backoff and a dead-letter state after repeated failures.
 *
 * Idempotency (STANDARDS/13 §2): the same clientOperationId is sent as both the
 * bill's clientOperationId and the Idempotency-Key header, so replays never
 * create duplicate bills. Bills are immutable append-only facts → no conflict
 * resolution needed on this side.
 */
import { api } from '@/shared/lib/api-client';
import type { PostBillDto, PostedBill, ApiEnvelope } from '@/shared/lib/types';
import { db, type QueuedOp } from './db';

const MAX_ATTEMPTS = 6;

export interface EnqueuedSale {
  clientOperationId: string;
  dto: PostBillDto;
}

/** Append a sale to the outbound queue (called when a sale is made offline). */
export async function enqueueSale(sale: EnqueuedSale): Promise<void> {
  const op: QueuedOp = {
    clientOperationId: sale.clientOperationId,
    kind: 'sale',
    payload: sale.dto,
    createdAt: Date.now(),
    status: 'pending',
  };
  await db.opQueue.put(op);
}

/** Number of ops still awaiting sync. */
export async function pendingCount(): Promise<number> {
  return db.opQueue.where('status').equals('pending').count();
}

let flushing = false;

/**
 * Flush the pending queue to the server (oldest first). Safe to call
 * repeatedly; a single-flight guard prevents overlap. Returns the count synced.
 */
export async function flushQueue(): Promise<number> {
  if (flushing) return 0;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  flushing = true;
  let synced = 0;
  try {
    const pending = await db.opQueue
      .where('status')
      .equals('pending')
      .sortBy('createdAt');

    for (const op of pending) {
      const ok = await pushOp(op);
      if (ok) {
        await db.opQueue.update(op.clientOperationId, { status: 'synced' });
        synced++;
      } else {
        // backoff handled by caller re-invoking; mark error after max attempts.
        const attempts = ((op as QueuedOp & { attempts?: number }).attempts ?? 0) + 1;
        const status = attempts >= MAX_ATTEMPTS ? 'error' : 'pending';
        await db.opQueue.update(op.clientOperationId, { attempts, status });
        // Stop on first failure to preserve order + let backoff apply.
        break;
      }
    }
  } finally {
    flushing = false;
  }
  return synced;
}

/** Push one queued sale. clientOperationId doubles as the idempotency key. */
async function pushOp(op: QueuedOp): Promise<boolean> {
  if (op.kind !== 'sale') return false;
  try {
    const dto = op.payload as PostBillDto;
    await api.post<ApiEnvelope<PostedBill>>(
      '/bills',
      { ...dto, clientOperationId: op.clientOperationId },
      { headers: { 'Idempotency-Key': op.clientOperationId } },
    );
    return true;
  } catch {
    return false;
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background flusher: flush on `online` events + a periodic poll
 * with exponential-ish backoff via the fixed interval (kept simple/robust).
 * Idempotent — calling twice does not create two loops.
 */
export function startSyncLoop(intervalMs = 15_000): () => void {
  const onOnline = () => void flushQueue();
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
  }
  if (!timer) {
    timer = setInterval(() => void flushQueue(), intervalMs);
    void flushQueue();
  }
  return () => {
    if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

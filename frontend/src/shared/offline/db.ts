import Dexie, { type EntityTable } from 'dexie';
import type { Item } from '@/shared/lib/types';

/**
 * IndexedDB (Dexie) — local store for offline-first POS (STANDARDS/02 §4).
 * MVP scope: catalog cache (for offline item lookup) + an outbound op queue
 * scaffold for future sale sync (ADR-004). Sales POSTs are queued here, never
 * cached by the service worker.
 */
export interface CachedItem extends Item {
  cachedAt: number;
}

export interface QueuedOp {
  clientOperationId: string; // uuid v7 (idempotency key)
  kind: 'sale';
  payload: unknown;
  createdAt: number;
  status: 'pending' | 'synced' | 'error';
  /** retry counter (populated by the sync queue; optional for back-compat). */
  attempts?: number;
}

const db = new Dexie('motech-pos') as Dexie & {
  catalog: EntityTable<CachedItem, 'code'>;
  opQueue: EntityTable<QueuedOp, 'clientOperationId'>;
};

db.version(1).stores({
  catalog: 'code, barcode, name',
  opQueue: 'clientOperationId, status, createdAt',
});

export { db };

/** Count of unsynced operations (shown in the UI). */
export async function pendingOpCount(): Promise<number> {
  return db.opQueue.where('status').equals('pending').count();
}

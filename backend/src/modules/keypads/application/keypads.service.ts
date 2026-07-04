import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogService } from '../../catalog/application/catalog.service';
import {
  AddKeypadKeyInput,
  KeypadsRepository,
  KEYPADS_REPOSITORY,
  UpsertKeypadInput,
} from '../domain/ports/keypads.port';

export interface CreateKeypadInput {
  keypadNo?: number;
  arName?: string;
  enName?: string;
  inactive?: boolean;
}

/**
 * KeypadsService — POSI002 (extra touch keypads) + POSI003 (item keys).
 * The keypad lets cashiers sell items without barcodes (produce, bakery…)
 * from touch pages grouped e.g. خضروات/فواكه. MOTECH_POS is authoritative
 * (the live YSPOS23 keypad tables are empty); item names/prices resolve
 * from the ERP master read-only.
 */
@Injectable()
export class KeypadsService {
  constructor(
    @Inject(KEYPADS_REPOSITORY) private readonly repo: KeypadsRepository,
    private readonly catalog: CatalogService,
  ) {}

  async list() {
    return this.repo.list();
  }

  async get(keypadNo: number) {
    const pad = await this.repo.find(keypadNo);
    if (!pad) throw new NotFoundException(`Keypad ${keypadNo} not found`);
    const keys = await this.repo.listKeys(keypadNo);
    return { ...pad, keys };
  }

  async create(input: CreateKeypadInput) {
    let keypadNo = input.keypadNo;
    if (keypadNo != null) {
      const dup = await this.repo.find(keypadNo);
      if (dup) {
        throw new ConflictException(`Keypad ${keypadNo} already exists`);
      }
    } else {
      keypadNo = await this.repo.nextKeypadNo();
    }
    return this.repo.upsert({
      keypadNo,
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      inactive: input.inactive ?? false,
    });
  }

  async update(keypadNo: number, input: Omit<UpsertKeypadInput, 'keypadNo'>) {
    const pad = await this.repo.find(keypadNo);
    if (!pad) throw new NotFoundException(`Keypad ${keypadNo} not found`);
    return this.repo.upsert({ keypadNo, ...input });
  }

  /** Link an item to the keypad (POSI003). Item must exist in ERP/overlay. */
  async addKey(input: AddKeypadKeyInput) {
    const pad = await this.repo.find(input.keypadNo);
    if (!pad) {
      throw new NotFoundException(`Keypad ${input.keypadNo} not found`);
    }
    // Throws ItemNotFoundError (404) when the item is unknown.
    await this.catalog.getByCode(input.itemCode);
    return this.repo.addKey(input);
  }

  async removeKey(keypadNo: number, keyId: string) {
    const pad = await this.repo.find(keypadNo);
    if (!pad) throw new NotFoundException(`Keypad ${keypadNo} not found`);
    const removed = await this.repo.removeKey(keyId);
    if (!removed) throw new NotFoundException(`Key ${keyId} not found`);
    return { keyId, removed };
  }
}

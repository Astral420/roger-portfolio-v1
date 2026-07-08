import type { PresenceRecord, RemoteCursor } from "./presence.types";

/**
 * In-memory presence store, single Node process (v1 — see
 * `PRESENCE_CHAT_IMPLEMENTATION_SPEC.md` §2 for the Redis upgrade path).
 * Records expire after `TTL_MS` without a refresh (cursor move, rename, or
 * app-level ping), which covers ungraceful disconnects.
 */
const TTL_MS = 15_000;

export class PresenceStore {
  private readonly records = new Map<string, PresenceRecord>();

  join(record: PresenceRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string): PresenceRecord | undefined {
    return this.records.get(id);
  }

  updateCursor(id: string, x: number, y: number): PresenceRecord | undefined {
    const record = this.records.get(id);
    if (!record) return undefined;

    record.x = x;
    record.y = y;
    record.lastSeen = Date.now();
    return record;
  }

  rename(id: string, name: string): PresenceRecord | undefined {
    const record = this.records.get(id);
    if (!record) return undefined;

    record.name = name;
    record.lastSeen = Date.now();
    return record;
  }

  touch(id: string): void {
    const record = this.records.get(id);
    if (record) record.lastSeen = Date.now();
  }

  remove(id: string): void {
    this.records.delete(id);
  }

  count(): number {
    return this.records.size;
  }

  list(): RemoteCursor[] {
    return Array.from(this.records.values(), (record) => ({
      id: record.id,
      name: record.name,
      guestNumber: record.guestNumber,
      color: record.color,
      x: record.x,
      y: record.y,
      updatedAt: record.lastSeen,
    }));
  }

  /** Removes and returns the ids of any record stale beyond `TTL_MS`. */
  sweepExpired(): string[] {
    const cutoff = Date.now() - TTL_MS;
    const expired: string[] = [];

    for (const [id, record] of this.records) {
      if (record.lastSeen < cutoff) expired.push(id);
    }

    for (const id of expired) this.records.delete(id);
    return expired;
  }
}

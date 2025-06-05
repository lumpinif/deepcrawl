import type { KVNamespace } from '@cloudflare/workers-types';

export interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export class CloudflareKVStorage implements SecondaryStorage {
  constructor(private kvNamespace: KVNamespace) {}

  async get(key: string): Promise<string | null> {
    return this.kvNamespace.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const options: KVNamespacePutOptions = {};
    if (ttl) {
      options.expirationTtl = ttl;
    }
    await this.kvNamespace.put(key, value, options);
  }

  async delete(key: string): Promise<void> {
    await this.kvNamespace.delete(key);
  }
}

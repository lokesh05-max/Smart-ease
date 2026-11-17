/**
 * Keyed async mutex to serialize concurrent operations on specific resources (e.g. slot booking)
 */
class KeyedMutex {
  constructor() {
    this.queues = new Map();
  }

  async acquire(key) {
    while (this.queues.has(key)) {
      await this.queues.get(key);
    }

    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });

    this.queues.set(key, promise);

    return () => {
      this.queues.delete(key);
      release();
    };
  }
}

export const slotMutex = new KeyedMutex();

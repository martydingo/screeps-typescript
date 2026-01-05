export interface PathCacheItem {
  ttl: number;
  path: string;
}

export interface RoomPathCache {
  [key: string]: {
    [key: string]: PathCacheItem;
  };
}

declare global {
  interface Memory {
    pathCache: {
      [key: string]: RoomPathCache;
    };
  }
  const pathCache = {};
}

export class MemoryDaemon {
  public static initialise() {
    MemoryDaemon.initialisePathCache();
  }

  private static initialisePathCache() {
    if (!Memory.pathCache) {
      Memory.pathCache = {};
    }
  }
}

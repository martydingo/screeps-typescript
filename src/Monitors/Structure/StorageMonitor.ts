import { Log, LogSeverity } from "utils/log";

export interface StorageMonitorMemory {
  [key: string]: {
    resources: {
      [key: string]: {
        amount: number;
        capacity: number;
      };
    };
  };
}

export class StorageMonitor {
  public constructor(storage: StructureStorage) {
    if (!storage.room.memory.structures!.storage) {
      storage.room.memory.structures!.storage = {};
      Log(
        LogSeverity.DEBUG,
        "StorageMonitor",
        `storage monitor memory not found, storage monitor memory initialised.`
      );
    }
    const resources: { [key: string]: { amount: number; capacity: number } } = {};
    Object.keys(storage.store).forEach(resourceName => {
      resources[resourceName] = {
        amount: storage.store[resourceName as ResourceConstant],
        capacity: storage.store.getCapacity(resourceName as ResourceConstant)
      };
    });

    storage.room.memory.structures!.storage[storage.id] = {
      resources
    };
        Log(LogSeverity.DEBUG, "StorageMonitor", `storage ${storage.id}} monitored.`);

  }
}

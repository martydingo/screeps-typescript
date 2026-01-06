import { profileClass, profileMethod } from "utils/Profiler";
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
  @profileClass("StorageMonitor")
  public static run(storage: StructureStorage) {
    if (!global.store.rooms[storage.room.name].structures!.storage!) {
      global.store.rooms[storage.room.name].structures!.storage = {};
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

    global.store.rooms[storage.room.name].structures!.storage![storage.id] = {
      resources
    };
        Log(LogSeverity.DEBUG, "StorageMonitor", `storage ${storage.id}} monitored.`);

  }
}

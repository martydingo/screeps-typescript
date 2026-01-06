import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface ContainerMonitorMemory {
  [key: string]: {
    resources: {
      [key: string]: {
        amount: number;
        capacity: number;
      };
    };
    hits: {
      hits: number;
      hitsMax: number;
    };
  };
}


export class ContainerMonitor {
    @profileClass("ContainerMonitor")
    public static run(container: StructureContainer) {
    if (!global.store.rooms[container.room.name].structures!.containers!) {
      global.store.rooms[container.room.name].structures!.containers = {};
      Log(
        LogSeverity.DEBUG,
        "ContainerMonitor",
        `container monitor memory not found, container monitor memory initialised.`
      );
    }

    const resources: { [key: string]: { amount: number; capacity: number } } = {};
    Object.keys(container.store).forEach(resourceName => {
      resources[resourceName] = {
        amount: container.store[resourceName as ResourceConstant],
        capacity: container.store.getCapacity(resourceName as ResourceConstant)
      };
    });

    global.store.rooms[container.room.name].structures!.containers![container.id] = {
        resources,
        hits: {
            hits: container.hits,
            hitsMax: container.hitsMax
        }
    };


    Log(LogSeverity.DEBUG, "ContainerMonitor", `container ${container.id}} monitored.`);
  }
}

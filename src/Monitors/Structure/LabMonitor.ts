import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface LabMonitorMemory {
  [key: string]: {
    resources: {
      [key: string]: {
        amount: number;
        capacity: number;
      };
    };
  };
}


export class LabMonitor {
  @profileClass("LabMonitor")
  public static run(lab: StructureLab) {
    if (!global.store.rooms[lab.room.name].structures!.labs!) {
      global.store.rooms[lab.room.name].structures!.labs = {};
      Log(LogSeverity.DEBUG, "LabMonitor", `lab monitor memory not found, lab monitor memory initialised.`);
    }

    const resources: { [key: string]: { amount: number; capacity: number } } = {};
    Object.keys(lab.store).forEach(resourceName => {
      resources[resourceName] = {
        amount: lab.store[resourceName as ResourceConstant],
        capacity: lab.store.getCapacity(resourceName as ResourceConstant) || 3000
      };
    });

    global.store.rooms[lab.room.name].structures!.labs![lab.id] = {
      resources
    };

    Log(LogSeverity.DEBUG, "LabMonitor", `lab ${lab.id}} monitored.`);
  }
}

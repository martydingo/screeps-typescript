import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface ExtensionMonitorMemory {
  [key: string]: {
    energy: {
      amount: number;
      capacity: number;
    };
    pos: RoomPosition;
  };
}


export class ExtensionMonitor {
  @profileClass("ExtensionMonitor")
  public static run(extension: StructureExtension) {
    if (!global.store.rooms[extension.room.name].structures!.extensions!) {
      global.store.rooms[extension.room.name].structures!.extensions = {};
      Log(
        LogSeverity.DEBUG,
        "ExtensionMonitor",
        `extension monitor memory not found, extension monitor memory initialised.`
      );
    }
    global.store.rooms[extension.room.name].structures!.extensions![extension.id] = {
      energy: {
        amount: extension.store[RESOURCE_ENERGY],
        capacity: extension.store.getCapacity(RESOURCE_ENERGY)
      },
      pos: extension.pos
    };
    Log(LogSeverity.DEBUG, "ExtensionMonitor", `extension ${extension.id}} monitored.`);
  }
}

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
  public constructor(extension: StructureExtension) {
    if (!extension.room.memory.structures!.extensions) {
      extension.room.memory.structures!.extensions = {};
      Log(
        LogSeverity.DEBUG,
        "ExtensionMonitor",
        `extension monitor memory not found, extension monitor memory initialised.`
      );
    }
    extension.room.memory.structures!.extensions[extension.id] = {
      energy: {
        amount: extension.store[RESOURCE_ENERGY],
        capacity: extension.store.getCapacity(RESOURCE_ENERGY)
      },
      pos: extension.pos
    };
    Log(LogSeverity.DEBUG, "ExtensionMonitor", `extension ${extension.id}} monitored.`);
  }
}

export interface ExtensionMonitorMemory {
  [key: string]: {
    energy: {
      amount: number;
      capacity: number;
    };
    pos: RoomPosition
  };
}

export class ExtensionMonitor {
  public constructor(extension: StructureExtension) {
    if (!extension.room.memory.structures!.extensions) {
      extension.room.memory.structures!.extensions = {};
    }
    extension.room.memory.structures!.extensions[extension.id] = {
      energy: {
        amount: extension.store[RESOURCE_ENERGY],
        capacity: extension.store.getCapacity(RESOURCE_ENERGY)
      },
      pos: extension.pos
    };
  }
}

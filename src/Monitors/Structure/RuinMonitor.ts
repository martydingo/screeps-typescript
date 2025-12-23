export interface RuinMonitorMemory {
  [key: string]: {
    energy: {
      amount: number;
    };
    pos: RoomPosition
  };
}

export class RuinMonitor {
  public constructor(ruin: Ruin) {
    if (!ruin.room!.memory.structures!.ruins) {
      ruin.room!.memory.structures!.ruins = {};
    }
    ruin.room!.memory.structures!.ruins[ruin.id] = {
      energy: {
        amount: ruin.store[RESOURCE_ENERGY],
      },
      pos: ruin.pos
    };
  }
}

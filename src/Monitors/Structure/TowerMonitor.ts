export interface TowerMonitorMemory {
  [key: string]: {
    hits: {
      current: number
      total: number
    }
    energy: {
      amount: number;
      capacity: number;
    };
    pos: RoomPosition
  };
}

export class TowerMonitor {
  public constructor(tower: StructureTower) {
    if (!tower.room.memory.structures!.towers) {
      tower.room.memory.structures!.towers = {};
    }
    tower.room.memory.structures!.towers[tower.id] = {
      hits: {
        current: tower.hits,
        total: tower.hitsMax
      },
      energy: {
        amount: tower.store[RESOURCE_ENERGY],
        capacity: tower.store.getCapacity(RESOURCE_ENERGY)
      },
      pos: tower.pos
    };
  }
}

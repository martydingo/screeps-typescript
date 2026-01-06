import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface TowerMonitorMemory {
  [key: string]: {
    hits: {
      current: number;
      total: number;
    };
    energy: {
      amount: number;
      capacity: number;
    };
    pos: RoomPosition;
  };
}


export class TowerMonitor {
  @profileClass("TowerMonitor")
  public static run(tower: StructureTower) {
    if (!global.store.rooms[tower.room.name].structures!.towers!) {
      global.store.rooms[tower.room.name].structures!.towers = {};
      Log(LogSeverity.DEBUG, "TowerMonitor", `tower monitor memory not found, tower monitor memory initialised.`);
    }
    global.store.rooms[tower.room.name].structures!.towers![tower.id] = {
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
    Log(LogSeverity.DEBUG, "TowerMonitor", `tower ${tower.id}} monitored.`);
  }
}

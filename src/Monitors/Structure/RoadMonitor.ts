import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface RoadMonitorMemory {
  [key: string]: {
    hits: {
      current: number;
      total: number;
    };
    pos: RoomPosition;
    decay: number
  };
}

@profileClass()
export class RoadMonitor {
  public constructor(road: StructureRoad) {
    if (!road.room.memory.structures!.roads) {
      road.room.memory.structures!.roads = {};
      Log(LogSeverity.DEBUG, "RoadMonitor", `Road monitor memory not found, Road monitor memory initialised.`);
    }
    road.room.memory.structures!.roads[road.id] = {
      hits: {
        current: road.hits,
        total: road.hitsMax
      },
      pos: road.pos,
      decay: road.ticksToDecay
    };
    Log(LogSeverity.DEBUG, "RoadMonitor", `Road ${road.id}} monitored.`);
  }
}

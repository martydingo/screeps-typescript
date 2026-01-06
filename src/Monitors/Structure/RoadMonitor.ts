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


export class RoadMonitor {
  @profileClass("RoadMonitor")
  public static run(road: StructureRoad) {
    if (!global.store.rooms[road.room.name].structures!.roads!) {
      global.store.rooms[road.room.name].structures!.roads = {};
      Log(LogSeverity.DEBUG, "RoadMonitor", `Road monitor memory not found, Road monitor memory initialised.`);
    }
    global.store.rooms[road.room.name].structures!.roads![road.id] = {
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

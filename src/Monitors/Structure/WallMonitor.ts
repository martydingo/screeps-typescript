import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface WallMonitorMemory {
  [key: string]: {
    hits: {
      current: number;
      total: number;
    };
    pos: RoomPosition;
  };
}


export class WallMonitor {
  @profileClass("WallMonitor")
  public static run(wall: StructureWall) {
    if (!global.store.rooms[wall.room.name].structures!.walls!) {
      global.store.rooms[wall.room.name].structures!.walls = {};
      Log(LogSeverity.DEBUG, "WallMonitor", `Wall monitor memory not found, Wall monitor memory initialised.`);
    }
    global.store.rooms[wall.room.name].structures!.walls![wall.id] = {
      hits: {
        current: wall.hits,
        total: wall.hitsMax
      },
      pos: wall.pos
    };
    Log(LogSeverity.DEBUG, "WallMonitor", `Wall ${wall.id}} monitored.`);
  }
}

import { profileClass } from "utils/Profiler";
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

@profileClass()
export class WallMonitor {
  public constructor(wall: StructureWall) {
    if (!wall.room.memory.structures!.walls) {
      wall.room.memory.structures!.walls = {};
      Log(LogSeverity.DEBUG, "WallMonitor", `Wall monitor memory not found, Wall monitor memory initialised.`);
    }
    wall.room.memory.structures!.walls[wall.id] = {
      hits: {
        current: wall.hits,
        total: wall.hitsMax
      },
      pos: wall.pos
    };
    Log(LogSeverity.DEBUG, "WallMonitor", `Wall ${wall.id}} monitored.`);
  }
}

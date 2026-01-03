import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface RuinMonitorMemory {
  [key: string]: {
    energy: {
      amount: number;
    };
    pos: RoomPosition;
  };
}

@profileClass()
export class RuinMonitor {
  public constructor(ruin: Ruin) {
    if (!ruin.room!.memory.structures!.ruins) {
      ruin.room!.memory.structures!.ruins = {};
      Log(LogSeverity.DEBUG, "RoadMonitor", `road monitor memory not found, road monitor memory initialised.`);
    }
    ruin.room!.memory.structures!.ruins[ruin.id] = {
      energy: {
        amount: ruin.store[RESOURCE_ENERGY]
      },
      pos: ruin.pos
    };
    Log(LogSeverity.DEBUG, "RuinMonitor", `ruin ${ruin.id}} monitored.`);
  }
}

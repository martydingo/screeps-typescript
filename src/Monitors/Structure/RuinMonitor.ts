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


export class RuinMonitor {
  @profileClass("RuinMonitor")
  public static run(ruin: Ruin) {
    if (!global.store.rooms[ruin.pos.roomName].structures!.ruins) {
      global.store.rooms[ruin.pos.roomName].structures!.ruins = {};
      Log(LogSeverity.DEBUG, "RoadMonitor", `road monitor memory not found, road monitor memory initialised.`);
    }
    global.store.rooms[ruin.pos.roomName].structures!.ruins![ruin.id] = {
      energy: {
        amount: ruin.store[RESOURCE_ENERGY]
      },
      pos: ruin.pos
    };
    Log(LogSeverity.DEBUG, "RuinMonitor", `ruin ${ruin.id}} monitored.`);
  }
}

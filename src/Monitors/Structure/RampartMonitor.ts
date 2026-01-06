import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface RampartMonitorMemory {
  [key: string]: {
    hits: {
      current: number;
      total: number;
    };
    pos: RoomPosition;
    decay: number
  };
}


export class RampartMonitor {
  @profileClass("RampartMonitor")
  public static run(rampart: StructureRampart) {
    if (!global.store.rooms[rampart.room.name].structures!.ramparts!) {
      global.store.rooms[rampart.room.name].structures!.ramparts = {};
      Log(LogSeverity.DEBUG, "RampartMonitor", `Rampart monitor memory not found, Rampart monitor memory initialised.`);
    }
    global.store.rooms[rampart.room.name].structures!.ramparts![rampart.id] = {
      hits: {
        current: rampart.hits,
        total: rampart.hitsMax
      },
      pos: rampart.pos,
      decay: rampart.ticksToDecay
    };
    Log(LogSeverity.DEBUG, "RampartMonitor", `Rampart ${rampart.id}} monitored.`);
  }
}

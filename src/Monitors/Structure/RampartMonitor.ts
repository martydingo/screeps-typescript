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
  public constructor(rampart: StructureRampart) {
    if (!rampart.room.memory.structures!.ramparts) {
      rampart.room.memory.structures!.ramparts = {};
      Log(LogSeverity.DEBUG, "RampartMonitor", `Rampart monitor memory not found, Rampart monitor memory initialised.`);
    }
    rampart.room.memory.structures!.ramparts[rampart.id] = {
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

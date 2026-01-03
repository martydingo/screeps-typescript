import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

interface SpawnMemory {
  energy: {
    amount: number;
    capacity: number;
  };
  spawning: boolean;
  room: string;
}

@profileClass()
export class SpawnMonitor {
  public constructor() {
    if (!Memory.spawns) {
      Memory.spawns = {};
      Log(LogSeverity.DEBUG, "SpawnMonitor", `spawn monitor memory not found, spawn monitor memory initialised.`);
    }

    Object.values(Game.spawns).forEach(spawn => {
      const payload: SpawnMemory = {
        energy: {
          amount: spawn.store[RESOURCE_ENERGY],
          capacity: spawn.store.getCapacity(RESOURCE_ENERGY)
        },
        spawning: (spawn.spawning !== null && true) || false,
        room: spawn.room.name
      };

      Memory.spawns[spawn.name] = payload;
      Log(LogSeverity.DEBUG, "SpawnMonitor", `spawn ${spawn.id} monitored.`);

    });

    Log(LogSeverity.DEBUG, "SpawnMonitor", `${Object.values(Memory.spawns).length} spawns monitored.`);
  }
}

import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

declare global {
  interface SpawnMemory {
    energy: {
      amount: number;
      capacity: number;
    };
    spawning: boolean;
    room: string;
    distances: { [key: string]: number };
  }
}
@profileClass()
export class SpawnMonitor {
  public static run() {
    {
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
          room: spawn.room.name,
          distances: spawn.memory.distances || {}
        };

        Memory.spawns[spawn.name] = payload;
        Log(LogSeverity.DEBUG, "SpawnMonitor", `spawn ${spawn.id} monitored.`);

      });

      Log(LogSeverity.DEBUG, "SpawnMonitor", `${Object.values(Memory.spawns).length} spawns monitored.`);
    }
  }
}

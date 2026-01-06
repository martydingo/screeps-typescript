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

export class SpawnMonitor {
  @profileClass("SpawnMonitor")
  public static run() {
    {
      if (!global.store.spawns) {
        global.store.spawns = {}
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
          distances: global.store.spawns[spawn.name].distances || {}
        };

        global.store.spawns[spawn.name] = payload
        Log(LogSeverity.DEBUG, "SpawnMonitor", `spawn ${spawn.id} monitored.`);

      });

      Log(LogSeverity.DEBUG, "SpawnMonitor", `${Object.values(global.store.spawns).length} spawns monitored.`);
    }
  }
}

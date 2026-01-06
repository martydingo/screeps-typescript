import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

interface SourceMemory {
  energy: {
    amount: number;
    capacity: number;
  };
  regeneration: number;
}

declare global {
  interface RoomMemory {
    sources?: { [key: string]: SourceMemory };
  }
}


export class SourceMonitor {
  @profileClass("SourceMonitor")
  public static run(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const sources = room.find(FIND_SOURCES);

      if (sources.length > 0) {
        if (!global.store.rooms[room.name].sources!) {
          global.store.rooms[room.name].sources = {};
          Log(
            LogSeverity.DEBUG,
            "SourceMonitor",
            `${roomName} source monitor memory not found, source monitor memory initialised.`
          );
        }

        sources.forEach(source => {
          global.store.rooms[room.name].sources![source.id] = {
            energy: {
              amount: source.energy,
              capacity: source.energyCapacity
            },
            regeneration: source.ticksToRegeneration
          };
          Log(LogSeverity.DEBUG, "SourceMonitor", `${roomName} - source ${source.id} monitored.`);
        });

        Log(LogSeverity.DEBUG, "SourceMonitor", `${roomName} - ${sources.length} sources monitored.`);
      }
    }
  }
}

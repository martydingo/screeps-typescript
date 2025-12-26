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
  public constructor(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const sources = room.find(FIND_SOURCES);

      if (sources.length > 0) {
        if (!room.memory.sources) {
          room.memory.sources = {};
          Log(
            LogSeverity.DEBUG,
            "SourceMonitor",
            `${roomName} source monitor memory not found, source monitor memory initialised.`
          );
        }

        sources.forEach(source => {
          room.memory.sources![source.id] = {
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

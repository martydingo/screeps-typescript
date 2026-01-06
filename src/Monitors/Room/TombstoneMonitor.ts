import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

interface TombstoneMonitorMemory {
  resources: {
    [key: string]: number;
  };
  pos: RoomPosition;
}

declare global {
  interface RoomMemory {
    tombstones?: { [key: string]: TombstoneMonitorMemory };
  }
}


export class TombstoneMonitor {
  @profileClass("TombstoneMonitor")
  public static run(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const tombstones = room.find(FIND_TOMBSTONES);

      if (tombstones.length > 0) {
        if (!global.store.rooms[room.name].tombstones!) {
          global.store.rooms[room.name].tombstones = {};
          Log(
            LogSeverity.DEBUG,
            "TombstoneMonitor",
            `${roomName} tombstone monitor memory not found, tombstone monitor memory initialised.`
          );
        }

        tombstones.forEach(tombstone => {
          const payload: Partial<TombstoneMonitorMemory> = {
            resources: {},
            pos: tombstone.pos
          };
          Object.entries(tombstone.store).forEach(
            ([resourceName, resourceAmount]) => (payload.resources![resourceName] = resourceAmount as number)
          );
          Log(LogSeverity.DEBUG, "TombstoneMonitor", `${roomName} - tombstone ${tombstone.id} monitored.`);
        });
        Log(LogSeverity.DEBUG, "TombstoneMonitor", `${roomName} - ${tombstones.length} tombstones monitored.`);

        Object.keys(global.store.rooms[roomName].tombstones!).forEach(tombstoneId => {
          if (Game.getObjectById(tombstoneId as Id<Tombstone>) === null) {
            delete global.store.rooms[roomName].tombstones![tombstoneId];
            Log(
              LogSeverity.DEBUG,
              "TombstoneMonitor",
              `${roomName} - tombstone ${tombstoneId} not found, deleting old tombstone monitor memory.`
            );
          }
        });
      }
    }
  }
}

import { config } from "config";
import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

interface HostileMemory {
  hits: {
    current: number;
    total: number;
  };
  body: {
    boost?: string | number;
    type: string;
    hits: number;
  }[];
  owner: string;
}

declare global {
  interface RoomMemory {
    hostiles?: { [key: string]: HostileMemory };
  }
}

@profileClass()
export class HostileMonitor {
  public static run(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      if (room) {
        if (!room.memory.hostiles) {
          room.memory.hostiles = {};
          Log(
            LogSeverity.DEBUG,
            "HostileMonitor",
            `${roomName} - hostiles detected but no hostile memory exists, room hostile monitor memory initialised.`
          );
        }

        Object.keys(room.memory.hostiles).forEach(
          hostileId =>
            Game.getObjectById(hostileId as Id<Creep>) == null &&
            delete room.memory.hostiles![hostileId]
        );

        let shouldMonitor = true;
        if (room.controller) {
          if (!room.controller.my) {
            if (!room.controller.reservation) {
              shouldMonitor = false;
            } else {
              if (
                room.controller.reservation.username !== config[Memory.env].username
              ) {
                shouldMonitor = false;
              }
            }
          }
        }

        if (shouldMonitor) {
          const hostiles = room.find(FIND_HOSTILE_CREEPS);

          if (hostiles.length > 0) {
            Log(
              LogSeverity.ALERT,
              "HostileMonitor",
              `${roomName} - ${hostiles.length} hostiles detected`
            );

            hostiles.forEach(hostile => {
              room.memory.hostiles![hostile.id] = {
                hits: {
                  current: hostile.hits,
                  total: hostile.hitsMax
                },
                body: hostile.body,
                owner: hostile.owner.username
              };
              Log(
                LogSeverity.DEBUG,
                "HostileMonitor",
                `${roomName} - hostile ${hostile.id} monitored.`
              );
            });
            Log(
              LogSeverity.DEBUG,
              "HostileMonitor",
              `${roomName} - ${hostiles.length} hostiles monitored.`
            );
          }
        }
      }
    }
  }
}

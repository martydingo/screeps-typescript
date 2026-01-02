import { Log, LogSeverity } from "utils/log";

interface ControllerMemory {
  owner?: {
    username: string
    my: boolean
  }
  upgrade: {
    progress: number;
    nextLevel: number;
  };
  safeMode: {
    active: boolean;
    available: number;
    timeLeft?: number;
    cooldown?: number;
  };
  downgrade: number;
  level: number;
}

declare global {
  interface RoomMemory {
    controller?: { [key: string]: ControllerMemory };
  }
}

export class ControllerMonitor {
  public constructor(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];

      if (room.controller) {
        if (!room.memory.controller) {
          room.memory.controller = {};
          Log(
            LogSeverity.DEBUG,
            "ControllerMonitor",
            `${roomName} controller monitor memory not found, controller monitor memory initialised.`
          );
        }

        const payload: Partial<ControllerMemory> = {
          upgrade: {
            progress: room.controller.progress,
            nextLevel: room.controller.progressTotal
          },
          downgrade: room.controller.ticksToDowngrade,
          level: room.controller.level

        };


        if (room.controller.owner !== undefined) {
          payload.owner = { username: room.controller.owner.username, my: room.controller.my }

        }
        if (room.controller.safeMode !== undefined) {
          Log(
            LogSeverity.WARNING,
            "ControllerMonitor",
            `${roomName} has been detected to be in safe mode! This may be concerning!`
          );
          Log(
            LogSeverity.WARNING,
            "ControllerMonitor",
            `There is currently ${room.controller.safeMode} ticks remaining before safe mode ends!`
          );
          payload.safeMode = {
            active: true,
            available: room.controller.safeModeAvailable,
            timeLeft: room.controller.safeMode
          };
        } else {
          payload.safeMode = {
            active: false,
            available: room.controller.safeModeAvailable,
            cooldown: room.controller.safeModeCooldown
          };
        }
        room.memory.controller[room.controller.id] = payload as ControllerMemory;
        Log(
          LogSeverity.DEBUG,
          "ControllerMonitor",
          `${roomName} - controller ${room.controller.id} is now monitored.`
        );
      }
    }
  }
}

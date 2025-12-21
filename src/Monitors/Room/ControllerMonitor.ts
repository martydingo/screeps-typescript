interface ControllerMemory {
  upgrade: {
    progress: number;
    nextLevel: number;
  }
  downgrade: number
  safeMode: {
    active: boolean
    available: number
    timeLeft?: number
    cooldown?: number
  }
  level: number
}

declare global {
  interface RoomMemory {
    controller?: {[key: string]: ControllerMemory}
  }
}

export class ControllerMonitor {
  public constructor(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName]

      if (room.controller) {
        if (!room.memory.controller) {
          room.memory.controller = {}
        }

        const payload: Partial<ControllerMemory> = {
          upgrade: {
            progress: room.controller.progress,
            nextLevel: room.controller.progressTotal
          },
          downgrade: room.controller.ticksToDowngrade,
          level: room.controller.level
        }

        if (room.controller.safeMode !== undefined) {
          payload.safeMode = {
            active: true,
            available: room.controller.safeModeAvailable,
            timeLeft: room.controller.safeMode,
          }
        } else {
            payload.safeMode = {
              active: false,
              available: room.controller.safeModeAvailable,
              cooldown: room.controller.safeModeCooldown
            }
          }
          room.memory.controller[room.controller.id] = payload as ControllerMemory
        }
      }
    }
}

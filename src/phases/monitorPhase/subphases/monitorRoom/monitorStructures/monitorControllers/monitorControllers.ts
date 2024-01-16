import { log } from "../../../../../../lib/utils/log";

function buildStructureMonitorMemory(roomName: string) {
    log.debug(`Building structure monitor memory for ${roomName}`)
    if (!Memory.rooms[roomName].monitoring.structures.controller) {
        Memory.rooms[roomName].monitoring.structures.controller = {} as ControllerMonitorData
    }

}

export function monitorController(roomName: string) {
    log.debug(`Monitoring controller in ${roomName}`)
    buildStructureMonitorMemory(roomName)
    if (Game.rooms[roomName].controller) {
        Memory.rooms[roomName].monitoring.structures.controller[Game.rooms[roomName].controller!.id] = {
            progress: Game.rooms[roomName].controller!.progress,
            nextLevel: Game.rooms[roomName].controller!.progressTotal,
            rcl: Game.rooms[roomName].controller!.level,
            downgrade: Game.rooms[roomName].controller!.ticksToDowngrade,
            safeMode: Game.rooms[roomName].controller!.safeMode && Game.rooms[roomName].controller!.safeMode || null
        }
    }
}

import { monitorStructures } from "./monitorStructures/monitorStructures"
import { log } from "../../../../lib/utils/log";

function buildRoomMonitorMemory(roomName: string) {
    log.debug(`Building room monitor memory for ${roomName}`)
    // Only needed for Mockup
    if (!Memory.rooms) {
        Memory.rooms = {}
    }

    if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {} as RoomMemory
    }
    // End of Mockup Requirement

    if (!Memory.rooms[roomName].monitoring) {
        Memory.rooms[roomName].monitoring = {} as RoomMonitorData
    }
    log.debug(Memory.rooms[roomName])
}

export function monitorRoom(roomName: string) {
    log.debug(`Monitoring room ${roomName}`)
    buildRoomMonitorMemory(roomName)
    monitorStructures(roomName)
}
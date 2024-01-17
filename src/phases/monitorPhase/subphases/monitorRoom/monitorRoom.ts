import { monitorStructures } from "./monitorStructures/monitorStructures"
import { log } from "../../../../lib/utils/log";
import { monitorResources } from "./monitorResources/monitorResources";
import { monitorConstruction } from "./monitorConstruction/monitorConstruction";
import { monitorHostiles } from "./monitorHostiles/monitorHostiles";

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
}

export function monitorRoom(roomName: string) {
    log.debug(`Monitoring room ${roomName}`)
    buildRoomMonitorMemory(roomName)
    monitorHostiles(roomName)
    monitorStructures(roomName)
    monitorResources(roomName)
    monitorConstruction(roomName)
}

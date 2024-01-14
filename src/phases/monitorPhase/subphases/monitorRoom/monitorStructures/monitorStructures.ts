import { monitorSources } from "./monitorSources/monitorSources"
import { log } from "../../../../../lib/utils/log";

function buildStructureMonitorMemory(roomName: string) {
    log.debug(`Building structure monitor memory for ${roomName}`)
    if (!Memory.rooms[roomName].monitoring.structures) {
        Memory.rooms[roomName].monitoring.structures = {} as StructureMonitorData
    }

}

export function monitorStructures(roomName: string){
    log.debug(`Monitoring structures in ${roomName}`)
    buildStructureMonitorMemory(roomName)
    monitorSources(roomName)
}

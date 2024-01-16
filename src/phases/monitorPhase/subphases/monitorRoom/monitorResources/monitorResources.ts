import { log } from "lib/utils/log"
import { monitorDroppedResources } from "./monitorDroppedResources/monitorDroppedResources"

function buildResourceMonitorMemory(roomName: string){
    log.debug(`Building resource monitor memory for ${roomName}`)
    if(!Memory.rooms[roomName].monitoring.resources){
        Memory.rooms[roomName].monitoring.resources = {} as ResourceMonitorData
    }
}

export function monitorResources(roomName: string){
    log.debug(`Monitoring resources in ${roomName}`)
    buildResourceMonitorMemory(roomName)
    monitorDroppedResources(roomName)
}

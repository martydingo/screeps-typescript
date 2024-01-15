import { log } from "../../../../../../lib/utils/log";

function buildSourceMonitorMemory(roomName: string){
    log.debug(`Building source monitor memory for ${roomName}`)
    if (!Memory.rooms[roomName].monitoring.structures.sources) {
        Memory.rooms[roomName].monitoring.structures.sources = {} as SourceMonitorData
    }
}

export function monitorSources(roomName: string){
    log.debug(`Monitoring sources in ${roomName}`)
    buildSourceMonitorMemory(roomName)
    const room = Game.rooms[roomName]
    const sources = room.find(FIND_SOURCES)
    Object.entries(sources).forEach(([sourceId, source]) => {
        log.debug(`Monitoring source ${sourceId} in ${roomName}`)
        const sourceMonitorEntry: SourceMonitorEntry = {
            energy: source.energy,
            energyCapacity: source.energyCapacity,
            regenTime: source.ticksToRegeneration
        }
        Memory.rooms[roomName].monitoring.structures.sources[sourceId as Id<Source>] = sourceMonitorEntry
    })
}

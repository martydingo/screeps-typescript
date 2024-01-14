import { log } from "lib/utils/log"

function buildSourceAnalysisMemory(roomName: string) {
    log.debug(`Building Source Analysis Memory for ${roomName}`)
    if(Memory.rooms[roomName].analysis.sources === undefined) {
        Memory.rooms[roomName].analysis.sources = {} as SourceAnalysisData
    }
}
function buildSourceAnalysisEntryMemory(roomName: string) {
    log.debug(`Building Source Analysis Entry Memory for ${roomName}`)
    Object.entries(Memory.rooms[roomName].monitoring.structures.sources).forEach(([sourceId, sourceData]) => {
        if (!Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>]) {
            Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>] = {
                assignedBot: null
            }
        }
    })
}
export function analyseSources(roomName: string) {
    log.debug(`Analysing sources in room ${roomName}`)
    buildSourceAnalysisMemory(roomName)
    buildSourceAnalysisEntryMemory(roomName)
}

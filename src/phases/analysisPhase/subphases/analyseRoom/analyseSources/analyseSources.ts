import { SourceBot } from "lib/utils/classes/bots/SourceBot/SourceBot"
import { log } from "lib/utils/log"

function buildSourceAnalysisMemory(roomName: string) {
    log.debug(`Building Source Analysis Memory for ${roomName}`)
    if (Memory.rooms[roomName].analysis.sources === undefined) {
        Memory.rooms[roomName].analysis.sources = {} as SourceAnalysisData
    }
}
function buildSourceAnalysisEntryMemory(roomName: string) {
    log.debug(`Building Source Analysis Entry Memory for ${roomName}`)
    Object.entries(Memory.rooms[roomName].monitoring.structures.sources).forEach(([sourceId, sourceData]) => {
        log.debug(`Analysing source ${sourceId} in room ${roomName}`)
        if (!Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>]) {
            Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>] = {
                assignedBot: null
            }
        }
    })
}

function createSourceBotJobs(roomName: string) {
    Object.entries(Memory.rooms[roomName].analysis.sources).forEach(([sourceId, sourceData]) => {
        if (sourceData.assignedBot === null) {
            const sourceBot = new SourceBot(sourceId as Id<Source>, roomName)
            const parts =  Object.values(Game.creeps).filter(creep => creep.memory.room === roomName).length > 0 && sourceBot.parts[Game.rooms[roomName].energyCapacityAvailable] || sourceBot.parts[Game.rooms[roomName].energyAvailable]
            if (!Memory.analysis.queues.spawn[sourceBot.name]) {
                Memory.analysis.queues.spawn[sourceBot.name] = {
                    name: sourceBot.name,
                    room: roomName,
                    priority: sourceBot.priority,
                    parts: parts,
                    memory: sourceBot.memory,
                    status: "new"
                }
            }
        }
    })
}

function assignSourceBotJobs(roomName: string){
    Object.keys(Memory.rooms[roomName].monitoring.structures.sources).forEach((sourceId) => {
        const sourceBot = new SourceBot(sourceId as Id<Source>, roomName)
        if(Game.creeps[sourceBot.name]){
            Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>].assignedBot = sourceBot.name
            delete Memory.analysis.queues.spawn[sourceBot.name]
        } else {
            Memory.rooms[roomName].analysis.sources[sourceId as Id<Source>].assignedBot = null
        }
    })
}

export function analyseSources(roomName: string) {
    log.debug(`Analysing sources in room ${roomName}`)
    buildSourceAnalysisMemory(roomName)
    buildSourceAnalysisEntryMemory(roomName)
    createSourceBotJobs(roomName)
    assignSourceBotJobs(roomName)
}

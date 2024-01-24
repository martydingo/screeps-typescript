import { TransportBot } from "lib/classes/bots/TransportBot/TransportBot"
import { log } from "lib/utils/log"

function buildSpawnQueueMemory() {
    log.debug("Building Spawn Queue Memory")
    if (!Memory.analysis.queues.spawn) {
        Memory.analysis.queues.spawn = {}
    }
}

function createSpawnTransportBotJobs() {
    const roomNames = Object.values(Game.spawns).map(spawn => spawn.room.name)
    roomNames.forEach(roomName => {
        const transportBot = new TransportBot(roomName, {
            dropOff: "spawns"
        })
        if (!Game.creeps[transportBot.name]) {
            Memory.analysis.queues.spawn[transportBot.name] = {
                name: transportBot.name,
                room: roomName,
                priority: Object.values(Game.creeps).filter(bot => bot.memory.role === "sourceBot" && bot.memory.room === roomName).length > 0 && 1 || transportBot.priority,
                parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
                memory: transportBot.memory,
                status: "new"
            }
        } else {
            delete Memory.analysis.queues.spawn[transportBot.name]
        }
    })
}

export function analyseSpawning() {
    log.debug("Analysing Spawns")
    buildSpawnQueueMemory()
    createSpawnTransportBotJobs()
    //
}

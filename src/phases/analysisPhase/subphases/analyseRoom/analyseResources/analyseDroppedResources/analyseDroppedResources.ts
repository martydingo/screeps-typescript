import { TransportBot } from "lib/utils/classes/bots/TransportBot/TransportBot"

function createTransportBotJobs(roomName: string) {
    let storageId: Id<StructureStorage> | null = null
    const storageArray = Object.keys(Memory.rooms[roomName].monitoring.structures.storage)
        .map(storageId => Game.getObjectById(storageId as Id<StructureStorage>))
        .filter(storage => storage) as StructureStorage[]

    if (storageArray.length > 0) {
        storageId = storageArray[0].id

        const transportBot = new TransportBot(roomName, { pickup: "loot", dropOff: storageId })
        Memory.analysis.queues.spawn[transportBot.name] = {
            name: transportBot.name,
            room: roomName,
            parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            priority: transportBot.priority,
            memory: transportBot.memory,
            status: "new"
        }
    }
}

export function analyseDroppedResources(roomName: string) {
    if (Object.values(Memory.rooms[roomName].monitoring.resources.droppedResources).length > 0) {
        let storageId: Id<StructureStorage> | null = null
        const storageArray = Object.keys(Memory.rooms[roomName].monitoring.structures.storage)
            .map(storageId => Game.getObjectById(storageId as Id<StructureStorage>))
            .filter(storage => storage) as StructureStorage[]

        if (storageArray.length > 0) {
            storageId = storageArray[0].id
            const transportBot = new TransportBot(roomName, { pickup: "loot", dropOff: storageId })
            if (!Game.creeps[transportBot.name]) {
                createTransportBotJobs(roomName)
            } else {
                delete Memory.analysis.queues.spawn[transportBot.name]
            }
        }
    } else {
        Object.entries(Memory.analysis.queues.spawn)
            .filter(([, spawnQueueEntry]) => spawnQueueEntry.memory.role === "transportBot" && spawnQueueEntry.memory.params.pickup === "loot" && spawnQueueEntry.memory.room === roomName)
            .forEach(([spawnQueueEntryName]) => {
                delete Memory.analysis.queues.spawn[spawnQueueEntryName]
            })
    }
}

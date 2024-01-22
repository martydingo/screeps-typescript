import { TransportBot } from "lib/utils/classes/bots/TransportBot/TransportBot"

function createLootTransportBotJob(roomName: string, storageId: Id<StructureStorage>) {
    const lootTransportBoot = new TransportBot(roomName, {
        dropOff: storageId,
        pickup: null
    })
    if (!Game.creeps[lootTransportBoot.name]) {
        Memory.analysis.queues.spawn[lootTransportBoot.name] = {
            name: lootTransportBoot.name,
            room: roomName,
            priority: lootTransportBoot.priority,
            parts: lootTransportBoot.parts[Game.rooms[roomName].energyCapacityAvailable],
            memory: lootTransportBoot.memory,
            status: "new"
        }
    } else {
        delete Memory.analysis.queues.spawn[lootTransportBoot.name]
    }
}

export function analyseStorage(roomName: string) {
    const storage = Object.keys(Memory.rooms[roomName].monitoring.structures.storage).map(storageId => Game.getObjectById(storageId as Id<StructureStorage>)).filter(storage => storage) as StructureStorage[]
    if (storage.length > 0) {

    }
}

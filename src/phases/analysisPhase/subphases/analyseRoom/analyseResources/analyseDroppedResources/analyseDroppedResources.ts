import { TransportBot } from "lib/utils/classes/bots/TransportBot/TransportBot"

function createTransportBotJobs(roomName: string){
        const transportBot = new TransportBot(roomName, {})
        Memory.analysis.queues.spawn[transportBot.name] = {
            name: transportBot.name,
            room: roomName,
            parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            priority: transportBot.priority,
            memory: transportBot.memory,
            status: "new"

        }
    }

export function analyseDroppedResources(roomName: string){
    if(Object.values(Memory.rooms[roomName].monitoring.resources.droppedResources).length > 0){
        if(Object.values(Game.creeps).filter((bot) => bot.memory.role === "transportBot" ).length === 0){
            createTransportBotJobs(roomName)
        }
    }
    if(Object.values(Game.creeps).filter((bot) => bot.memory.role === "transportBot" ).length > 0){
        const transportBot = new TransportBot(roomName, {})
        delete Memory.analysis.queues.spawn[transportBot.name]
    }
}

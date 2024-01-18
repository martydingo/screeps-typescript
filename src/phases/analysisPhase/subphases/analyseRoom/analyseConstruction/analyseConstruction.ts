import { BuildBot } from "lib/utils/classes/bots/BuildBot/BuildBot";

function createBuildBotJobs(roomName: string, index: number) {

    const buildBot = new BuildBot(roomName, index)
    if (!Memory.analysis.queues.spawn[buildBot.name]) {
        Memory.analysis.queues.spawn[buildBot.name] = {
            name: buildBot.name,
            room: roomName,
            parts: buildBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            priority: buildBot.priority,
            memory: buildBot.memory,
            status: "new"
        }
    }

}

function deleteBuildBotJobs(roomName: string, index: number) {
    const buildBot = new BuildBot(roomName, index)
    if (Memory.analysis.queues.spawn[buildBot.name]) {
        delete Memory.analysis.queues.spawn[buildBot.name]
    }
}

export function analyseConstruction(roomName: string) {
    const buildBotCount = Math.round(Object.keys(Memory.rooms[roomName].monitoring.construction).length / 3)

    for (let index = 1; index <= buildBotCount; index++) {
        const buildBot = new BuildBot(roomName, index)
        if (Object.keys(Memory.rooms[roomName].monitoring.construction).length > 0) {
            if (Game.creeps[buildBot.name]) {
                deleteBuildBotJobs(roomName, index)
            } else {
                createBuildBotJobs(roomName, index)
            }
        } else {
            deleteBuildBotJobs(roomName, index)
        }
    }
}

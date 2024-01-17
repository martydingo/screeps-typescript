import { UpgradeBot } from "lib/utils/classes/bots/UpgradeBot/UpgradeBot"
import { log } from "lib/utils/log"

function buildControllerMemory(roomName: string) {
    if (!Memory.rooms[roomName].analysis.controller) {
        Memory.rooms[roomName].analysis.controller = {} as ControllerAnalysisData
    }
}

function createUpgradeBotJob(roomName: string) {
    const controllerId = Object.keys(Memory.rooms[roomName].monitoring.structures.controller)[0] as Id<StructureController>
    if (Memory.rooms[roomName].analysis.controller.assignedBot === null) {
        const upgradeBot = new UpgradeBot(controllerId, roomName)
        if (!Memory.analysis.queues.spawn[upgradeBot.name]) {
            Memory.analysis.queues.spawn[upgradeBot.name] = {
                name: upgradeBot.name,
                room: roomName,
                priority: upgradeBot.priority,
                parts: upgradeBot.parts[Game.rooms[roomName].energyCapacityAvailable],
                memory: upgradeBot.memory,
                status: "new"
            }
        }
    }
}

function assignUpgradeBotJobs(roomName: string) {
    Object.keys(Memory.rooms[roomName].monitoring.structures.controller).forEach((controllerId) => {
        const upgradeBot = new UpgradeBot(controllerId as Id<StructureController>, roomName)
        if (Game.creeps[upgradeBot.name]) {
            Memory.rooms[roomName].analysis.controller.assignedBot = upgradeBot.name
            delete Memory.analysis.queues.spawn[upgradeBot.name]
        } else {
            Memory.rooms[roomName].analysis.controller.assignedBot = null
        }
    })
}

export function analyseController(roomName: string) {
    log.debug(`Analysing controller in room ${roomName}`)
    buildControllerMemory(roomName)
    createUpgradeBotJob(roomName)
    assignUpgradeBotJobs(roomName)




}


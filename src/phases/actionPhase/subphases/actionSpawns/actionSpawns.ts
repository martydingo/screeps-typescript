import { log } from "lib/utils/log"

function processSpawnedCreeps() {
    Object.entries(Memory.analysis.queues.spawn)
        .filter(([, spawnEntry]) => { spawnEntry.status === "spawning" })
        .forEach(([botName]) => {
            if(Game.creeps[botName]){
                if(Game.creeps[botName].id !== undefined){
                    delete Memory.analysis.queues.spawn[botName]
                }
            }
        })
}

function processNewSpawnRequests() {

    const spawnQueue = Object.entries(Memory.analysis.queues.spawn)
        .filter(([, botData]) => botData.status === "new")
        .sort(([, a], [, b]) => a.priority - b.priority)

    if (spawnQueue.length === 0) {
        return
    }
    const botName = spawnQueue[0][0]
    const botData = spawnQueue[0][1]
    const spawn = Object.values(Game.spawns).filter((spawn) => spawn.room.name === botData.room && !spawn.spawning)[0]
        if (spawn) {
            const spawnResult = spawn.spawnCreep(botData.parts, botData.name, { memory: botData.memory })
            log.info(`Spawning ${botName} in ${botData.room} with result ${spawnResult}`)
            if (spawnResult === OK) {
                Memory.analysis.queues.spawn[botName].status = "spawning"
            }
        }

}

function processSpawnQueue() {
    processNewSpawnRequests()
    processSpawnedCreeps()
}

export function actionSpawns() {
    processSpawnQueue()
}

import { spawn } from "child_process"

function processSpawnQueue() {
    const spawnQueue = Object.entries(Memory.analysis.queues.spawn)
        .sort(([, a], [, b]) => a.priority - b.priority)
        spawnLoop: for (const [botName, botData] of spawnQueue){
            const spawn = Object.values(Game.spawns).filter((spawn) => spawn.room.name === botData.room && !spawn.spawning)[0]
            if (spawn) {
                const spawnResult = spawn.spawnCreep(botData.parts, botData.name, { memory: botData.memory })
                console.log(`Spawning ${botName} in ${botData.room} with result ${spawnResult}`)
                if (spawnResult === OK) {
                    console.log(Game.creeps[botName].id)
                    delete Memory.analysis.queues.spawn[botName]
                    break spawnLoop;
                }
            }
        }
    }

export function actionSpawns() {
    processSpawnQueue()
}

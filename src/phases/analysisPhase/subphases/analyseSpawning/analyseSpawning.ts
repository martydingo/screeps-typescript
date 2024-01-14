import { log } from "lib/utils/log"

function buildSpawnQueueMemory() {
    log.debug("Building Spawn Queue Memory")
    if (!Memory.analysis.queues.spawn) {
        Memory.analysis.queues.spawn = {}
    }
}
export function analyseSpawning() {
    log.debug("Analysing Spawns")
    buildSpawnQueueMemory()
    //
}

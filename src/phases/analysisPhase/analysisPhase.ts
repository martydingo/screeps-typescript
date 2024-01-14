import { analyseRoom } from "./subphases/analyseRoom/analyseRoom"
import { config } from "config/config"
import { log } from "lib/utils/log"
import { analyseSpawning } from "./subphases/analyseSpawning/analyseSpawning"

function buildAnalysisMemory() {
    log.debug("Building Analysis Memory")
    if(!Memory.analysis) {
        Memory.analysis = {
            queues: {}
        } as AnalysisMemory
    }
    if(!Memory.analysis.queues) {
        Memory.analysis.queues = {} as AnalysisMemory["queues"]
    }
}

export function analysisPhase() {
    log.debug("Running Analysis Phase")
    buildAnalysisMemory()

    analyseSpawning()


    const roomsToAnalyse = config.rooms.activeRooms
    roomsToAnalyse.forEach(roomName => {
        analyseRoom(roomName)
    })
}

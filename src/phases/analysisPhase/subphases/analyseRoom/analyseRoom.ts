import { log } from "lib/utils/log"
import { analyseSources } from "./analyseSources/analyseSources"
import { analyseResources } from "./analyseResources/analyseResources"
import { analyseController } from "./analyseController/analyseController"
import { analyseConstruction } from "./analyseConstruction/analyseConstruction"
import { analyseTowers } from "./analyseTowers/analyseTowers"

function buildRoomAnalysisMemory(roomName: string) {
    log.debug(`Building Room Analysis Memory for ${roomName}`)
    if(Memory.rooms[roomName].analysis === undefined) {
        Memory.rooms[roomName].analysis = {} as RoomAnalysisData
    }
}
export function analyseRoom(roomName: string) {
    log.debug(`Analysing room ${roomName}`)
    buildRoomAnalysisMemory(roomName)
    analyseSources(roomName)
    analyseResources(roomName)
    analyseController(roomName)
    analyseConstruction(roomName)
    analyseTowers(roomName)
}

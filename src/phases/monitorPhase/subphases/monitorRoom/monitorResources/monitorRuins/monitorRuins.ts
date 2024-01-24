import { TransportBot } from "lib/classes/bots/TransportBot/TransportBot"
import { log } from "lib/utils/log"

function buildRuinsMonitorMemory(roomName: string){
    log.debug(`Building dropped resource monitor memory for ${roomName}`)
    if(!Memory.rooms[roomName].monitoring.resources.ruins){
        Memory.rooms[roomName].monitoring.resources.ruins = {} as RuinMonitorData
    }
}

function cleanRuinsMonitoring(roomName: string){
    Object.keys(Memory.rooms[roomName].monitoring.resources.ruins).forEach((ruinsId) => {
        if(Game.getObjectById(ruinsId  as Id<Resource<ResourceConstant>>) === null){
            delete Memory.rooms[roomName].monitoring.resources.ruins[ruinsId as Id<Ruin>]
        }
    })
}

function documentRuins(roomName: string){
    Object.values(Game.rooms[roomName].find(FIND_RUINS)).forEach((ruin) => {
        Memory.rooms[roomName].monitoring.resources.ruins[ruin.id] = {
            contents: ruin.store
        }
    })
}



export function monitorRuins(roomName: string){
    log.debug(`Monitoring dropped resources in ${roomName}`)
    buildRuinsMonitorMemory(roomName)
    cleanRuinsMonitoring(roomName)
    documentRuins(roomName)
}

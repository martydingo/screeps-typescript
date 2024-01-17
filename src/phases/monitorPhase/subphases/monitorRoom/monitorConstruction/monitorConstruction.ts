function buildConstructionMonitorMemory(roomName: string) {
    if(!Memory.rooms[roomName].monitoring.construction){
        Memory.rooms[roomName].monitoring.construction = {} as ConstructionMonitorData
    }
}

function documentConstruction(roomName: string){
    Object.values(Game.constructionSites)
    .filter((constructionSite) => constructionSite.pos.roomName === roomName)
    .forEach((constructionSite) => {
        Memory.rooms[roomName].monitoring.construction[constructionSite.id] = {
            progress: constructionSite.progress,
            progressTotal: constructionSite.progressTotal,
            structureType: constructionSite.structureType
        }
    })
}

function cleanConstruction(roomName: string){
    Object.keys(Memory.rooms[roomName].monitoring.construction)
    .forEach((constructionSiteId) => {
        if(Game.getObjectById(constructionSiteId as Id<ConstructionSite>) === null){
            delete Memory.rooms[roomName].monitoring.construction[constructionSiteId as Id<ConstructionSite>]
        }
    })
}

export function monitorConstruction(roomName: string){
    buildConstructionMonitorMemory(roomName)
    cleanConstruction(roomName)
    documentConstruction(roomName)
}

function buildLinkMonitorMemory(roomName: string){
    if(!Memory.rooms[roomName].monitoring.structures.links){
        Memory.rooms[roomName].monitoring.structures.links = {}
    }
}

export function monitorLinks(roomName: string){
    buildLinkMonitorMemory(roomName)

    const linksInRoom = Object.values(Game.structures).filter((structure) => structure.structureType === STRUCTURE_LINK && structure.pos.roomName === roomName) as StructureLink[]

    linksInRoom.forEach((link) => {
        Memory.rooms[roomName].monitoring.structures.links[link.id] = {
            energy: link.store[RESOURCE_ENERGY],
            energyCapacity: link.store.getCapacity(RESOURCE_ENERGY),
            cooldown: link.cooldown
        }
    })
}

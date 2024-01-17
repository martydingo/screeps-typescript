function buildTowerMonitorMemory(roomName: string){
    if(!Memory.rooms[roomName].monitoring.structures.towers){
        Memory.rooms[roomName].monitoring.structures.towers = {}
    }
}

export function monitorTowers(roomName: string){
    buildTowerMonitorMemory(roomName)
    const towers = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_TOWER && structure.room.name === roomName) as StructureTower[]
    towers.forEach(tower => {
        if(!Memory.rooms[roomName].monitoring.structures.towers[tower.id]){
            Memory.rooms[roomName].monitoring.structures.towers[tower.id] = {
                energy: tower.store[RESOURCE_ENERGY]
            }
        }
    })

}

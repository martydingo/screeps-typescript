function buildRoadMonitorMemory(roomName: string){
    if(!Memory.rooms[roomName].monitoring.structures.roads){
        Memory.rooms[roomName].monitoring.structures.roads = {}
    }
}

export function monitorRoads(roomName: string){
    buildRoadMonitorMemory(roomName)
    const roads = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_ROAD && structure.room.name === roomName) as StructureRoad[]
    roads.forEach(road => {
        if(!Memory.rooms[roomName].monitoring.structures.roads[road.id]){
            Memory.rooms[roomName].monitoring.structures.roads[road.id] = {
                hits: road.hits,
                hitsMax: road.hitsMax,
                decayTime: road.ticksToDecay,            }
        }
    })

}

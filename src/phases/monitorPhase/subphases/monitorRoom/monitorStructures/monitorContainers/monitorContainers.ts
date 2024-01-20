function buildContainerMonitorMemory(roomName: string){
    if(!Memory.rooms[roomName].monitoring.structures.containers){
        Memory.rooms[roomName].monitoring.structures.containers = {}
    }
}

export function monitorContainers(roomName: string){
    buildContainerMonitorMemory(roomName)
    const room = Game.rooms[roomName]
    if (room) {
        const containers = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType === STRUCTURE_CONTAINER }) as StructureContainer[]
        containers.forEach(container => {
            if (!Memory.rooms[roomName].monitoring.structures.containers[container.id]) {
                Memory.rooms[roomName].monitoring.structures.containers[container.id] = {
                    hits: container.hits,
                    hitsMax: container.hitsMax,
                    decayTime: container.ticksToDecay,
                    contents: container.store
                }
            }
        })
    }
}

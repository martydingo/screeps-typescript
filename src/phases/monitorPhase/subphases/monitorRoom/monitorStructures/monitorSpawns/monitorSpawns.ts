function buildSpawnMonitorMemory(roomName: string){
    if(!Memory.rooms[roomName].monitoring.structures.spawns){
        Memory.rooms[roomName].monitoring.structures.spawns = {}
    }
}

export function monitorSpawns(roomName: string){
    buildSpawnMonitorMemory(roomName)

    Object.values(Game.spawns)
    .filter((spawn) => spawn.pos.roomName === roomName)
    .forEach((spawn) => {
        Memory.rooms[roomName].monitoring.structures.spawns[spawn.id] = {
            energy: spawn.store[RESOURCE_ENERGY],
            energyCapacity: spawn.store.getCapacity(RESOURCE_ENERGY),
            spawning: spawn.spawning && 1 || 0
        }
    })
}

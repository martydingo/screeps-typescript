function buildHostileMonitorMemory(roomName: string) {
    if(!Memory.rooms[roomName].monitoring.hostiles) {
        Memory.rooms[roomName].monitoring.hostiles = {}
    }
}

export function monitorHostiles(roomName: string) {
    buildHostileMonitorMemory(roomName)
    const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)
    hostiles.forEach(hostile => {
        Memory.rooms[roomName].monitoring.hostiles[hostile.id] = {
            hits: hostile.hits,
            hitsMax: hostile.hitsMax,
            parts: hostile.body.map(part => part.type),
            owner: hostile.owner.username
        }
    })
}

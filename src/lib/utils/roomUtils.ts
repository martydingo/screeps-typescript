export function getOwnedRooms() {
    return Object.keys(Game.rooms).filter(roomName => Game.rooms[roomName].controller && Game.rooms[roomName].controller?.my);
}

export function findClosestStorage(roomName: string) {
    const storages = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_STORAGE)
    const storageMatrix: { [key: Id<StructureStorage>]: number } = {}

    storages.forEach((storage) => {
        const distanceFromStorage = Game.map.getRoomLinearDistance(roomName, storage.room.name)
        storageMatrix[storage.id as Id<StructureStorage>] = distanceFromStorage
    })

    const sortedStorageMatrix = Object.entries(storageMatrix).sort(([, a], [, b]) => a - b)
    if (sortedStorageMatrix.length > 0) {
        return sortedStorageMatrix[0][0] as Id<StructureStorage>
    }
    return
}

export function findClosestSpawn(roomName: string): StructureSpawn | null {
    const spawns = Object.values(Game.spawns).filter(spawn => spawn.room.name === roomName)
    if (spawns.length > 0) {
        return spawns[0]
    } else {
        const spawnMatrix: { [key: string]: number } = {}
        Object.values(Game.spawns).forEach((spawn) => {
            const distanceFromSpawn = Game.map.getRoomLinearDistance(roomName, spawn.room.name)
            spawnMatrix[spawn.name] = distanceFromSpawn
        })
        const sortedSpawnMatrix = Object.entries(spawnMatrix).sort(([, a], [, b]) => a - b)
        const spawnName = sortedSpawnMatrix[0][0]
        return Game.spawns[spawnName]
    }

}

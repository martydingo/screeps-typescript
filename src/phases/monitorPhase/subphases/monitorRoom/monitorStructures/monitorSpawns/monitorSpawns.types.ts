export {}

declare global {
    type SpawnMonitorEntry = {
        energy: number
        energyCapacity: number
        spawning: number
    }

    type SpawnMonitorData = {
        [key: Id<StructureSpawn>]: SpawnMonitorEntry
    }
}

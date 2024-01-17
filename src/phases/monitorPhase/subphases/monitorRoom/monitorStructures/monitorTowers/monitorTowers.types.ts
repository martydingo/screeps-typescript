
export {}
declare global {
    type TowerMonitorEntry = {
        energy: number
    }

    type TowerMonitorData = {
        [key: Id<StructureTower>]: TowerMonitorEntry
    }
}

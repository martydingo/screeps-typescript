
export {}
declare global {
    type RoadMonitorEntry = {
        hits: number
        hitsMax: number
        decayTime: number
    }

    type RoadMonitorData = {
        [key: Id<StructureRoad>]: RoadMonitorEntry
    }
}


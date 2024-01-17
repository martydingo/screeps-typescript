export {}

declare global {
    type ConstructionMonitorEntry = {
        progress: number
        progressTotal: number
        structureType: BuildableStructureConstant
    }

    type ConstructionMonitorData = {
        [key: Id<ConstructionSite>]: ConstructionMonitorEntry
    }
}


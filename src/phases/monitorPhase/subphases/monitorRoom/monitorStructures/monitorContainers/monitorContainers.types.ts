
export {}
declare global {
    type ContainerMonitorEntry = {
        hits: number
        hitsMax: number
        contents: StoreDefinition
        decayTime: number
    }

    type ContainerMonitorData = {
        [key: Id<StructureContainer>]: ContainerMonitorEntry
    }
}


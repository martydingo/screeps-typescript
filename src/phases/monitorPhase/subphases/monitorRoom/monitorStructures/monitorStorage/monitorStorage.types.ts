
export {}
declare global {
    type StorageMonitorEntry = {
        contents: StoreDefinition
    }

    type StorageMonitorData = {
        [key: Id<StructureStorage>]: StorageMonitorEntry
    }
}


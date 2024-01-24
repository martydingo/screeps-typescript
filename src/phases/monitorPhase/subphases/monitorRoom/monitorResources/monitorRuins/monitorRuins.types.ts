export {}
declare global {
    type RuinMonitorEntry = {
        contents: StoreDefinition
    }

    type RuinMonitorData = {
        [key: Id<Ruin>]: RuinMonitorEntry
    }
}

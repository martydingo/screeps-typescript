export {}

declare global {
    type LinkMonitorEntry = {
        energy: number
        energyCapacity: number
        // mode: "send" | "receive" | "both"
        cooldown: number
    }

    type LinkMonitorData = {
        [key: Id<StructureLink>]: LinkMonitorEntry
    }
}

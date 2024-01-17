export {}

declare global {
    type ExtensionMonitorEntry = {
        energy: number
        energyCapacity: number
    }

    type ExtensionMonitorData = {
        [key: Id<StructureExtension>]: ExtensionMonitorEntry
    }
}

export { };

declare global {
    type StructureMonitorData = {
        sources: SourceMonitorData
        controller: ControllerMonitorData
        extensions: ExtensionMonitorData
        towers: TowerMonitorData
        storage: StorageMonitorData
    }
}

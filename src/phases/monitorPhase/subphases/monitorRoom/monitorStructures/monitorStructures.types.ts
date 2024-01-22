export { };

declare global {
    type StructureMonitorData = {
        sources: SourceMonitorData
        spawns: SpawnMonitorData
        controller: ControllerMonitorData
        extensions: ExtensionMonitorData
        towers: TowerMonitorData
        storage: StorageMonitorData
        roads: RoadMonitorData
        containers: ContainerMonitorData
        links: LinkMonitorData
    }
}

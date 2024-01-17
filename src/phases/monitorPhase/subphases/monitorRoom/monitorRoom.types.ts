export { }

declare global {
    type RoomMonitorData = {
        structures: StructureMonitorData;
        resources: ResourceMonitorData;
        construction: ConstructionMonitorData;
        hostiles: HostileMonitorData;
    }

    interface RoomMemory {
        monitoring: RoomMonitorData;
    }
}

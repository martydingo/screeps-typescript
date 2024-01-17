export { }

declare global {
    type RoomMonitorData = {
        structures: StructureMonitorData;
        resources: ResourceMonitorData;
        construction: ConstructionMonitorData;
    }

    interface RoomMemory {
        monitoring: RoomMonitorData;
    }
}

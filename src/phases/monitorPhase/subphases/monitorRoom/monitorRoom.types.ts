export { }

declare global {
    type RoomMonitorData = {
        structures: StructureMonitorData;
        resources: ResourceMonitorData;
    }

    interface RoomMemory {
        monitoring: RoomMonitorData;
    }
}

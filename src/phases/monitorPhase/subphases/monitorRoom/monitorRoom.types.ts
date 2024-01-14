export { }

declare global {
    type RoomMonitorData = {
        structures: StructureMonitorData;
    }

    interface RoomMemory {
        monitoring: RoomMonitorData;
    }
}

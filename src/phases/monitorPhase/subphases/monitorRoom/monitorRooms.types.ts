export {};

declare global {
  interface RoomMonitorData {
    structures: StructureMonitorData;
    resources: ResourceMonitorData;
    construction: ConstructionMonitorData;
    hostiles: HostileMonitorData;
  }

  interface RoomMemory {
    monitoring: RoomMonitorData;
  }
}

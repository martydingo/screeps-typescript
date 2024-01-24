export {};
declare global {
  interface DroppedResourceMonitorEntry {
    resourceType: ResourceConstant;
    pos: RoomPosition;
    amount: number;
  }

  interface DroppedResourceMonitorData {
    [key: Id<Resource<ResourceConstant>>]: DroppedResourceMonitorEntry;
  }
}

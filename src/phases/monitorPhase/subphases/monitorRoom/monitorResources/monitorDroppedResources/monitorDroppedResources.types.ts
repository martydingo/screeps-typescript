export {}
declare global {
    type DroppedResourceMonitorEntry = {
        resourceType: ResourceConstant
        pos: RoomPosition
        amount: number
    }

    type DroppedResourceMonitorData = {
        [key: Id<Resource<ResourceConstant>>]: DroppedResourceMonitorEntry
    }
}

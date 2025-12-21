interface ResourceMemory {
    amount: number
    resource: ResourceConstant
    pos: RoomPosition
}

declare global {
    interface RoomMemory {
        resources?: { [key: string]: ResourceMemory }
    }
}

export class ResourceMonitor {
    public constructor(roomName: string) {
        if (Game.rooms[roomName]) {
            const room = Game.rooms[roomName]
            const resources = room.find(FIND_DROPPED_RESOURCES)

            if (resources.length > 0) {
                if (!room.memory.resources) {
                    room.memory.resources = {}
                }

                resources.forEach((resource) => room.memory.resources![resource.id] = {
                    amount: resource.amount,
                    resource: resource.resourceType,
                    pos: resource.pos
                })
            }

            Object.keys(Memory.rooms[roomName].resources!).forEach((resourceId) => Game.getObjectById(resourceId as Id<Resource>) === null && delete Memory.rooms[roomName].resources![resourceId])
        }
    }
}

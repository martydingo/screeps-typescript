interface HostileMemory {
  hits: {
    current: number;
    total: number;
  };
  body: {
    boost?: string | number;
    type: string;
    hits: number;
  }[];
  owner: string;
}

declare global {
  interface RoomMemory {
    hostiles?: { [key: string]: HostileMemory };
  }
}

export class HostileMonitor {
  public constructor(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
        if (room) {
            if (room.memory.hostiles) {
                Object.keys(room.memory.hostiles).forEach(
                    hostileId => Game.getObjectById(hostileId as Id<Creep>) == null && delete room.memory.hostiles![hostileId]
                );
            }
            const hostiles = room.find(FIND_HOSTILE_CREEPS);


            if (hostiles.length > 0) {
                if (!room.memory.hostiles) {
                    room.memory.hostiles = {};
                }

                hostiles.forEach(
                    hostile =>
                    (room.memory.hostiles![hostile.id] = {
                        hits: {
                            current: hostile.hits,
                            total: hostile.hitsMax
                        },
                        body: hostile.body,
                        owner: hostile.owner.username
                    })
                );
            }
        }
    }
  }
}

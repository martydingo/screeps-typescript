function buildHostileMonitorMemory(roomName: string) {
  if (!Memory.rooms[roomName].monitoring.hostiles) {
    Memory.rooms[roomName].monitoring.hostiles = {};
  }
}

function cleanHostileMonitorMemory(roomName: string) {
  Object.keys(Memory.rooms[roomName].monitoring.hostiles).forEach(hostileId => {
    if (!Game.getObjectById(hostileId as Id<Creep>)) {
      delete Memory.rooms[roomName].monitoring.hostiles[hostileId as Id<Creep>];
    }
  });
}

export function monitorHostiles(roomName: string) {
  buildHostileMonitorMemory(roomName);
  cleanHostileMonitorMemory(roomName);
  const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
  hostiles.forEach(hostile => {
    Memory.rooms[roomName].monitoring.hostiles[hostile.id] = {
      hits: hostile.hits,
      hitsMax: hostile.hitsMax,
      parts: hostile.body.map(part => part.type),
      owner: hostile.owner.username
    };
  });
}

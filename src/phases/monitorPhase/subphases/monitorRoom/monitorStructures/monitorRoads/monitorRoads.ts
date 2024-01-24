function buildRoadMonitorMemory(roomName: string) {
  if (!Memory.rooms[roomName].monitoring.structures.roads) {
    Memory.rooms[roomName].monitoring.structures.roads = {};
  }
}

export function monitorRoads(roomName: string) {
  buildRoadMonitorMemory(roomName);
  let roads: StructureRoad[] = [];
  const room = Game.rooms[roomName];
  if (room) {
    Object.keys(Memory.rooms[roomName].monitoring.structures.roads).forEach(roadId => {
      if (!Game.getObjectById(roadId as Id<StructureRoad>)) {
        delete Memory.rooms[roomName].monitoring.structures.roads[roadId as Id<StructureRoad>];
      }
    });
    roads = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType === STRUCTURE_ROAD });
  }
  roads.forEach(road => {
    Memory.rooms[roomName].monitoring.structures.roads[road.id] = {
      hits: road.hits,
      hitsMax: road.hitsMax,
      decayTime: road.ticksToDecay
    };
  });
}

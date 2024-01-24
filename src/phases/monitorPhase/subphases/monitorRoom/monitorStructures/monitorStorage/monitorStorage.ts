function buildStorageMonitorMemory(roomName: string) {
  if (!Memory.rooms[roomName].monitoring.structures.storage) {
    Memory.rooms[roomName].monitoring.structures.storage = {};
  }
}

export function monitorStorage(roomName: string) {
  buildStorageMonitorMemory(roomName);
  const storage = Object.values(Game.structures).filter(
    structure => structure.structureType === STRUCTURE_STORAGE && structure.room.name === roomName
  ) as StructureStorage[];
  storage.forEach(storage => {
    Memory.rooms[roomName].monitoring.structures.storage[storage.id] = {
      contents: storage.store
    };
  });
}

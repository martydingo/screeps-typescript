function buildExtensionMonitorMemory(roomName: string) {
  if (!Memory.rooms[roomName].monitoring.structures.extensions) {
    Memory.rooms[roomName].monitoring.structures.extensions = {};
  }
}

export function monitorExtensions(roomName: string) {
  buildExtensionMonitorMemory(roomName);

  Object.values(Game.structures)
    .filter(structure => structure.structureType === STRUCTURE_EXTENSION && structure.pos.roomName === roomName)
    .forEach(extension => {
      const typedExtension = extension as StructureExtension;
      Memory.rooms[roomName].monitoring.structures.extensions[typedExtension.id] = {
        energy: typedExtension.store[RESOURCE_ENERGY],
        energyCapacity: typedExtension.store.getCapacity(RESOURCE_ENERGY)
      };
    });
}

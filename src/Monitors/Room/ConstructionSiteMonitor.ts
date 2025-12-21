interface ConstructionSiteMemory {
  progress: {
    progress: number;
    total: number;
  };
  pos: RoomPosition;
}

declare global {
  interface RoomMemory {
    constructionSites?: { [key: string]: ConstructionSiteMemory };
  }
}

export class ConstructionSiteMonitor {
  public constructor(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const constructionSites = room.find(FIND_CONSTRUCTION_SITES);

      if (constructionSites.length > 0) {
        if (!room.memory.constructionSites) {
          room.memory.constructionSites = {};
        }

        constructionSites.forEach(
          constructionSite =>
            (room.memory.constructionSites![constructionSite.id] = {
              progress: {
                progress: constructionSite.progress,
                total: constructionSite.progressTotal
              },
              pos: constructionSite.pos
            })
        );
      }
    }
    if (Memory.rooms[roomName].constructionSites) {
      if (Object.values(Memory.rooms[roomName].constructionSites!).length > 0) {
        Object.keys(Memory.rooms[roomName].constructionSites!).forEach(
          constructionSiteId =>
            Game.getObjectById(constructionSiteId as Id<ConstructionSite>) === null &&
            delete Memory.rooms[roomName].constructionSites![constructionSiteId]
        );
      }
    }
  }
}

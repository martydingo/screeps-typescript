import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

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
  @profileClass("ConstructionSiteMonitor")
  public static run(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const constructionSites = room.find(FIND_CONSTRUCTION_SITES);

      if (constructionSites.length > 0) {
        if (!global.store.rooms[room.name].constructionSites!) {
          global.store.rooms[room.name].constructionSites = {};
          Log(
            LogSeverity.DEBUG,
            "ConstructionSiteMonitor",
            `${roomName} construction site monitor memory not found, construction site monitor memory initialised.`
          );
        }

        constructionSites.forEach(constructionSite => {
          global.store.rooms[room.name].constructionSites![constructionSite.id] = {
            progress: {
              progress: constructionSite.progress,
              total: constructionSite.progressTotal
            },
            pos: constructionSite.pos
          };
          Log(LogSeverity.DEBUG, "ConstructionSiteMonitor", `${roomName} - construction site ${constructionSite.id} monitored.`);
        });
        Log(
          LogSeverity.DEBUG,
          "ConstructionSiteMonitor",
          `${roomName} construction sites monitored, counting ${constructionSites.length} construction sites.`
        );
      }
    }
    if (global.store.rooms[roomName].constructionSites) {
      if (Object.values(global.store.rooms[roomName].constructionSites!).length > 0) {
        Object.keys(global.store.rooms[roomName].constructionSites!).forEach(constructionSiteId => {
          if (Game.getObjectById(constructionSiteId as Id<ConstructionSite>) === null) {
            delete global.store.rooms[roomName].constructionSites![constructionSiteId];
            Log(
              LogSeverity.DEBUG,
              "ConstructionSiteMonitor",
              `${roomName} construction site ${constructionSiteId} not found, old construction site monitor memory deleted.`
            );
          }
        });
      }
    }
  }
}

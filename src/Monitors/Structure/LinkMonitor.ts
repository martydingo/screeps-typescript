import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface LinkMonitorMemory {
  [key: string]: {
    energy: {
      amount: number;
      capacity: number;
    };
    pos: RoomPosition;
    distances: { [key: string]: { distance: number; type: "storage" | "source" | "controller" } };
    linkType: "unknown" | "storage" | "source" | "controller";
  };
}


export class LinkMonitor {
  @profileClass("LinkMonitor")
  public static run(link: StructureLink) {
    if (!global.store.rooms[link.room.name].structures!.links!) {
      global.store.rooms[link.room.name].structures!.links = {};
      Log(LogSeverity.DEBUG, "LinkMonitor", `link monitor memory not found, link monitor memory initialised.`);
    }
    if (!global.store.rooms[link.room.name].structures!.links![link.id]!) {
      global.store.rooms[link.room.name].structures!.links![link.id] = {
        energy: {
          amount: link.store[RESOURCE_ENERGY],
          capacity: link.store.getCapacity(RESOURCE_ENERGY)
        },
        pos: link.pos,
        distances: {},
        linkType: "unknown"
      };
    } else {
      global.store.rooms[link.room.name].structures!.links![link.id].energy = {
        amount: link.store[RESOURCE_ENERGY],
        capacity: link.store.getCapacity(RESOURCE_ENERGY)
      };
    }
    Log(LogSeverity.DEBUG, "LinkMonitor", `link ${link.id}} monitored.`);
  }
}

import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

interface ResourceMonitorMemory {
  amount: number;
  resource: ResourceConstant;
  pos: RoomPosition;
}

declare global {
  interface RoomMemory {
    resources?: { [key: string]: ResourceMonitorMemory };
  }
}

@profileClass()
export class ResourceMonitor {
  public static run(roomName: string) {
    if (Game.rooms[roomName]) {
      const room = Game.rooms[roomName];
      const resources = room.find(FIND_DROPPED_RESOURCES);

      if (resources.length > 0) {
        if (!room.memory.resources) {
          room.memory.resources = {};
          Log(
            LogSeverity.DEBUG,
            "ResourceMonitor",
            `${roomName} resource monitor memory not found, resource monitor memory initialised.`
          );
        }

        resources.forEach(resource => {
          room.memory.resources![resource.id] = {
            amount: resource.amount,
            resource: resource.resourceType,
            pos: resource.pos
          };
          Log(LogSeverity.DEBUG, "ResourceMonitor", `${roomName} - resource ${resource.id} monitored.`);
        });
        Log(LogSeverity.DEBUG, "ResourceMonitor", `${roomName} - ${resources.length} resources monitored.`);

        Object.keys(Memory.rooms[roomName].resources!).forEach(resourceId => {
          if (Game.getObjectById(resourceId as Id<Resource>) === null) {
            delete Memory.rooms[roomName].resources![resourceId];
            Log(
              LogSeverity.DEBUG,
              "ResourceMonitor",
              `${roomName} - resource ${resourceId} not found, deleting old resource monitor memory.`
            );
          }
        });
      }
    }
  }
}

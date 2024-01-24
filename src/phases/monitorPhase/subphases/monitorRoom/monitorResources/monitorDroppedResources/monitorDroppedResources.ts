import { TransportBot } from "lib/classes/bots/TransportBot/TransportBot";
import { log } from "lib/utils/log";

function buildDroppedResourceMonitorMemory(roomName: string) {
  log.debug(`Building dropped resource monitor memory for ${roomName}`);
  if (!Memory.rooms[roomName].monitoring.resources.droppedResources) {
    Memory.rooms[roomName].monitoring.resources.droppedResources = {} as DroppedResourceMonitorData;
  }
}

function cleanDroppedResourceMonitoring(roomName: string) {
  Object.keys(Memory.rooms[roomName].monitoring.resources.droppedResources).forEach(droppedResourceId => {
    if (Game.getObjectById(droppedResourceId as Id<Resource<ResourceConstant>>) === null) {
      delete Memory.rooms[roomName].monitoring.resources.droppedResources[
        droppedResourceId as Id<Resource<ResourceConstant>>
      ];
    }
  });
}

function documentDroppedResources(roomName: string) {
  Object.values(Game.rooms[roomName].find(FIND_DROPPED_RESOURCES)).forEach(droppedResource => {
    Memory.rooms[roomName].monitoring.resources.droppedResources[droppedResource.id] = {
      resourceType: droppedResource.resourceType,
      pos: droppedResource.pos,
      amount: droppedResource.amount
    };
  });
}

export function monitorDroppedResources(roomName: string) {
  log.debug(`Monitoring dropped resources in ${roomName}`);
  buildDroppedResourceMonitorMemory(roomName);
  cleanDroppedResourceMonitoring(roomName);
  documentDroppedResources(roomName);
}

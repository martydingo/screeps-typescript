import { monitorStructures } from "./monitorStructures/monitorStructures";
import { config } from "../../../../config/config";
import { log } from "../../../../lib/utils/log";
import { monitorResources } from "./monitorResources/monitorResources";
import { monitorConstruction } from "./monitorConstruction/monitorConstruction";
import { monitorHostiles } from "./monitorHostiles/monitorHostiles";
import { findClosestSpawn, getOwnedRooms } from "lib/utils/roomUtils";
import { ExplorerBot } from "lib/classes/bots/ExplorerBot/ExplorerBot";

function buildRoomMonitorMemory(roomName: string) {
  log.debug(`Building room monitor memory for ${roomName}`);
  // Only needed for Mockup
  if (!Memory.rooms) {
    Memory.rooms = {};
  }

  if (!Memory.rooms[roomName]) {
    Memory.rooms[roomName] = {} as RoomMemory;
  }
  // End of Mockup Requirement

  if (!Memory.rooms[roomName].monitoring) {
    Memory.rooms[roomName].monitoring = {} as RoomMonitorData;
  }
}

function createExplorerBotJobs(roomName: string) {
  let params = { isClaiming: false, isReserving: false };
  let parts: BodyPartConstant[] = [MOVE];
  if (Memory.rooms[roomName].monitoring.structures) {
    const controllerArray = Object.keys(Memory.rooms[roomName].monitoring.structures.controller);
    if (controllerArray.length > 0) {
      const controller = controllerArray[0] as Id<StructureController>;
      if (controller) {
        const closestSpawn = findClosestSpawn(roomName);
        if (closestSpawn) {
          if (closestSpawn.room.energyCapacityAvailable >= 1250 && config.rooms.roomsToMine.includes(roomName)) {
            params = { isClaiming: false, isReserving: true };
            parts = [MOVE, CLAIM, CLAIM];
          }
          if (closestSpawn.room.energyCapacityAvailable >= 650 && config.rooms.roomsToClaim.includes(roomName)) {
            params = { isClaiming: true, isReserving: false };
            parts = [MOVE, CLAIM];
          }
        }
      }
    }
  }

  const explorerBot = new ExplorerBot(roomName, params);
  if (Memory.analysis.queues.spawn) {
    if (!Game.creeps[explorerBot.name]) {
      Memory.analysis.queues.spawn[explorerBot.name] = {
        name: explorerBot.name,
        room: roomName,
        priority: explorerBot.priority,
        parts,
        memory: explorerBot.memory,
        status: "new"
      };
    } else {
      delete Memory.analysis.queues.spawn[explorerBot.name];
    }
  }
}

export function monitorRooms() {
  const roomsToMonitor: string[] = [...getOwnedRooms()];

  [...config.rooms.roomsToMine, ...config.rooms.roomsToClaim].forEach(roomName => {
    buildRoomMonitorMemory(roomName);
    if (Game.rooms[roomName]) {
      roomsToMonitor.push(roomName);
      if (Game.rooms[roomName].controller) {
        if (!Game.rooms[roomName].controller!.my) {
          const closestSpawn = findClosestSpawn(roomName);
          if (closestSpawn) {
            if (config.rooms.roomsToMine.includes(roomName) && closestSpawn.room.energyCapacityAvailable >= 1250) {
              createExplorerBotJobs(roomName);
            } else if (
              config.rooms.roomsToClaim.includes(roomName) &&
              closestSpawn.room.energyCapacityAvailable >= 650
            ) {
              createExplorerBotJobs(roomName);
            }
          }
        }
      }
    } else {
      if (Memory.analysis.queues) {
        createExplorerBotJobs(roomName);
      }
    }
  });

  roomsToMonitor.forEach(roomName => {
    log.debug(`Monitoring room ${roomName}`);
    buildRoomMonitorMemory(roomName);
    monitorHostiles(roomName);
    monitorStructures(roomName);
    monitorResources(roomName);
    monitorConstruction(roomName);
  });
}

import { spawn } from "child_process";
import { config } from "config/config";
import { log } from "lib/utils/log";
import { findClosestSpawn } from "lib/utils/roomUtils";

function clearBadSpawnRequests() {
  Object.entries(Memory.analysis.queues.spawn)
    .filter(([, spawnEntry]) => spawnEntry.parts === undefined)
    .forEach(([botName, spawnEntry]) => {
      const spawn = findClosestSpawn(spawnEntry.memory.room)!;
      const parts = config.bots[`${spawnEntry.memory.role}s`].parts[spawn.room.energyCapacityAvailable];
      if(!parts){
        console.log(spawnEntry.memory.role, spawn.room.energyCapacityAvailable, config.bots[`${spawnEntry.memory.role}s`].parts)
        log.debug(`Clearing bad spawn request for ${botName} in ${spawnEntry.room}`)
        delete Memory.analysis.queues.spawn[botName];
      } else {
        Memory.analysis.queues.spawn[botName].parts = parts;
        if(spawn.pos.roomName !== spawnEntry.memory.room){{
          Memory.analysis.queues.spawn[botName].priority = Memory.analysis.queues.spawn[botName].priority + 1
        }
      }
    }

    });
}

function processSpawnedCreeps() {
  Object.entries(Memory.analysis.queues.spawn)
    .filter(([, spawnEntry]) => {
      spawnEntry.status === "spawning";
    })
    .forEach(([botName]) => {
      if (Game.creeps[botName]) {
        if (Game.creeps[botName].id !== undefined) {
          delete Memory.analysis.queues.spawn[botName];
        }
      }
    });
}

function processNewSpawnRequests(roomName: string) {
  const spawnQueue = Object.entries(Memory.analysis.queues.spawn)
    .filter(([, botData]) => botData.status === "new" && botData.room === roomName)
    .sort(([, a], [, b]) => a.priority - b.priority);

  if (spawnQueue.length === 0) {
    return;
  }
  const botName = spawnQueue[0][0];
  const botData = spawnQueue[0][1];
  const spawns = Object.values(Game.spawns).filter(spawn => spawn.room.name === botData.room && !spawn.spawning);
  let spawn: StructureSpawn;
  let parts: BodyPartConstant[];
  parts = botData.parts;
  if (spawns.length > 0) {
    spawn = spawns[0];
  } else {
    spawn = findClosestSpawn(botData.room)!;
  }
    // console.log(`${parts}, ${botData.name}, ${{ memory: botData.memory }}`);
    const spawnResult = spawn.spawnCreep(parts, botData.name, { memory: botData.memory });
    log.info(`Spawning ${botName} in ${botData.room} with result ${spawnResult}`);
    if (spawnResult === OK) {
      Memory.analysis.queues.spawn[botName].status = "spawning";
    }
}

function processSpawnQueue() {
  clearBadSpawnRequests();
  const roomsWithSpawns = Object.values(Game.spawns).map(spawn => spawn.room.name);
  roomsWithSpawns.forEach((roomName) => processNewSpawnRequests(roomName))
  processSpawnedCreeps();
}

export function actionSpawns() {
  processSpawnQueue();
}

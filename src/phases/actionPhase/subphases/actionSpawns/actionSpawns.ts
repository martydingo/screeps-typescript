import { config } from "config/config";
import { log } from "lib/utils/log";
import { findClosestSpawn } from "lib/utils/roomUtils";

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

function processNewSpawnRequests() {
  const spawnQueue = Object.entries(Memory.analysis.queues.spawn)
    .filter(([, botData]) => botData.status === "new")
    .sort(([, a], [, b]) => a.priority - b.priority);

  if (spawnQueue.length === 0) {
    return;
  }
  const botName = spawnQueue[0][0];
  const botData = spawnQueue[0][1];
  const spawns = Object.values(Game.spawns).filter(spawn => spawn.room.name === botData.room && !spawn.spawning);
  let spawn: StructureSpawn;
  let parts: BodyPartConstant[];
  if (spawns.length) {
    spawn = spawns[0];
    parts = botData.parts;
  } else {
    spawn = findClosestSpawn(botData.memory.room)!;
    parts = config.bots[`${botData.memory.role}s`].parts[spawn.room.energyCapacityAvailable];
  }
  const spawnResult = spawn.spawnCreep(parts, botData.name, { memory: botData.memory });
  log.info(`Spawning ${botName} in ${botData.room} with result ${spawnResult}`);
  if (spawnResult === OK) {
    Memory.analysis.queues.spawn[botName].status = "spawning";
  }
}

function processSpawnQueue() {
  processNewSpawnRequests();
  processSpawnedCreeps();
}

export function actionSpawns() {
  processSpawnQueue();
}

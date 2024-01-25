import { config } from "config/config";
import { UpgradeBot } from "lib/classes/bots/UpgradeBot/UpgradeBot";
import { log } from "lib/utils/log";

function buildControllerMemory(roomName: string) {
  if (!Memory.rooms[roomName].analysis.controller) {
    Memory.rooms[roomName].analysis.controller = {} as ControllerAnalysisData;
  }
}

function manageUpgradeBotJobs(roomName: string) {
  const controllerId = Object.keys(
    Memory.rooms[roomName].monitoring.structures.controller
  )[0] as Id<StructureController>;
  const controller = Game.getObjectById(controllerId);
  if (!controller) {
    return;
  }
  if (!controller.my) {
    return;
  }

  Object.keys(Memory.rooms[roomName].monitoring.structures.controller).forEach(controllerId => {
    const upgradeBotCount = config.bots.upgradeBots.count;
    for (let i = 1; i <= upgradeBotCount; i++) {
      const upgradeBot = new UpgradeBot(controllerId as Id<StructureController>, roomName, i);
      if (!Game.creeps[upgradeBot.name]) {
        if (!Memory.analysis.queues.spawn[upgradeBot.name]) {
          log.debug(`Creating upgrade bot job for ${upgradeBot.name} in ${roomName}`);
          Memory.analysis.queues.spawn[upgradeBot.name] = {
            name: upgradeBot.name,
            room: roomName,
            priority: upgradeBot.priority,
            parts: upgradeBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            memory: upgradeBot.memory,
            status: "new"
          };
        }
      } else {
        delete Memory.analysis.queues.spawn[upgradeBot.name];
      }
    }
  });
}

export function analyseController(roomName: string) {
  log.debug(`Analysing controller in room ${roomName}`);
  buildControllerMemory(roomName);
  manageUpgradeBotJobs(roomName);
}

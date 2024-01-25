import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { log } from "lib/utils/log";

export class Bot {
  public memory = {} as BotMemory;
  public parts = {} as BotParts;
  public constructor() {}
  public harvestSource(bot: Creep) {
    const source = Game.getObjectById(this.memory.params.sourceId as Id<Source>) as Source;
    if (bot.harvest(source) === ERR_NOT_IN_RANGE) {
      bot.moveTo(source);
    }
  }
  public pickupResource(bot: Creep, resource: Resource<ResourceConstant>) {
    const pickupResult = bot.pickup(resource);
    if (pickupResult === ERR_NOT_IN_RANGE) {
      const moveResult = bot.moveTo(resource);
      if (moveResult !== OK) {
        log.info(`${bot.name} suffered ${moveResult} while moving`);
      }
    } else if (pickupResult !== OK) {
      log.info(`${bot.name} suffered ${pickupResult} while picking up`);
    }
  }
  public dropOffResource(bot: Creep, structure: Structure<StructureConstant>, resource: ResourceConstant) {
    const transferResult = bot.transfer(structure, resource);
    if (transferResult === ERR_NOT_IN_RANGE) {
      const moveResult = bot.moveTo(structure);
      if (moveResult !== OK) {
        log.info(`${bot.name} suffered ${moveResult} while moving`);
      }
    } else if (transferResult !== OK) {
      log.info(`${bot.name} suffered ${transferResult} while dropping ${resource} off at ${structure}`);
    }
  }

  public pickupEnergy(bot: Creep) {
    const droppedEnergy = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.droppedResources).sort(
      ([, droppedResourceA], [, droppedResourceB]) => droppedResourceB.amount - droppedResourceA.amount
    );
    if (droppedEnergy[0]) {
      this.pickupResource(bot, Game.getObjectById(droppedEnergy[0][0] as Id<Resource<ResourceConstant>>)!);
    }
  }

  public withdrawEnergy(bot: Creep, structure: Structure<StructureConstant> | Ruin) {
    const withdrawResult = bot.withdraw(structure, RESOURCE_ENERGY);
    if (withdrawResult === ERR_NOT_IN_RANGE) {
      bot.moveTo(structure);
    }
  }

  public scavengeEnergyFromRuin(bot: Creep) {
    // const ruins = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins)
    //     .sort(([, ruinA], [, ruinB]) => ruinA.contents[RESOURCE_ENERGY] - ruinB.contents[RESOURCE_ENERGY]
    //     )
    // const ruinId = ruins[0][0] as Id<Ruin>
    const ruins: Ruin[] = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins)
      .filter(([, ruinMonitorData]) => ruinMonitorData.contents[RESOURCE_ENERGY] > 0)
      .map(([ruinId]) => Game.getObjectById(ruinId as Id<Ruin>)!);

    const ruin = bot.pos.findClosestByPath(ruins);

    if (ruin) {
      if (ruin.store[RESOURCE_ENERGY] > 0) {
        this.withdrawEnergy(bot, ruin);
      }
    }
  }

  public fetchEnergy(bot: Creep) {
    const room = Game.rooms[bot.memory.room];
    if (room) {
      const storage = room.storage;
      if (storage) {
        if (storage.store[RESOURCE_ENERGY] > bot.store.getFreeCapacity()) {
          this.withdrawEnergy(bot, storage);
        }
      } else {
        const ruins = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins);
        if (ruins.length > 0) {
          this.scavengeEnergyFromRuin(bot);
        } else {
          this.pickupEnergy(bot);
        }
      }
    }
  }

  public fillSpawn(bot: Creep) {
    const spawnsInRoom = Object.values(Game.spawns)
      .filter(spawn => spawn.room.name == bot.memory.room && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      .sort(
        (spawnA, spawnB) =>
          spawnA.store[RESOURCE_ENERGY] / spawnA.store.getCapacity(RESOURCE_ENERGY) -
          spawnB.store[RESOURCE_ENERGY] / spawnB.store.getCapacity(RESOURCE_ENERGY)
      );
    if (spawnsInRoom.length > 0) {
      this.dropOffResource(bot, spawnsInRoom[0], RESOURCE_ENERGY);
    } else {
      const extensionsInRoom: StructureExtension[] = [];
      Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.extensions).forEach(extensionId => {
        extensionsInRoom.push(Game.getObjectById(extensionId as Id<StructureExtension>)!);
      });
      const sortedExtensions = extensionsInRoom
        .filter(extension => extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        .sort((extensionA, extensionB) => extensionA.store[RESOURCE_ENERGY] - extensionB.store[RESOURCE_ENERGY])

        const closestExtension = bot.pos.findClosestByPath(sortedExtensions);

      if (closestExtension) {
        this.dropOffResource(bot, closestExtension, RESOURCE_ENERGY);
      }
    }
  }

  public recycleBot(bot: Creep) {
    const roomSpawn = Object.values(Game.spawns).filter(spawn => spawn.pos.roomName === bot.memory.room)[0];
    const recycleResult = roomSpawn.recycleCreep(bot);
    if (recycleResult === ERR_NOT_IN_RANGE) {
      bot.moveTo(roomSpawn);
    }
  }

  public repairStructure(bot: Creep, structure: Structure<StructureConstant>) {
    const repairResult = bot.repair(structure);
    if (repairResult === ERR_NOT_IN_RANGE) {
      bot.moveTo(structure);
    }
  }
}

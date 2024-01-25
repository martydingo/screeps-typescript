import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";
import { log } from "lib/utils/log";

export class BuildBot extends Bot {
  public memory: BuildBotMemory;
  public parts: BotParts = config.bots.buildBots.parts;
  public priority: number = config.bots.buildBots.priority;
  public role: string = config.bots.buildBots.role;
  public name: string;
  public constructor(roomName: string, index: number) {
    super();
    this.memory = {
      role: config.bots.buildBots.role,
      params: {},
      room: roomName
    };
    this.name = `bB-${roomName}-${index}`;
  }
  private buildConstructionSite(bot: Creep): void {
    const constructionSiteEntries = Object.entries(Memory.rooms[bot.memory.room].monitoring.construction).sort(
      ([, constructionSiteA], [, constructionSiteB]) =>
        constructionSiteB.progress / constructionSiteB.progressTotal -
        constructionSiteA.progress / constructionSiteA.progressTotal
    )[0];
    if (constructionSiteEntries) {
      const constructionSiteId = constructionSiteEntries[0] as Id<ConstructionSite>;
      if (constructionSiteId) {
        const constructionSite = Game.getObjectById(constructionSiteId);
        log.debug(`BuildBot ${bot.name} is building ${constructionSiteId}`);
        if (constructionSite) {
          const buildResult = bot.build(constructionSite);
          if (buildResult == ERR_NOT_IN_RANGE) {
            bot.moveTo(constructionSite);
          } else if (buildResult != OK) {
            log.info(`BuildBot ${bot.name} encountered error ${buildResult} while building ${constructionSiteId}`);
          }
        }
      }
    } else {
      this.recycleBot(bot);
    }
  }

  public runBot(bot: Creep): void {
    if (!bot.memory.status) {
      if (bot.spawning) {
        bot.memory.status = "spawning";
        return;
      }
    }
    if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
      bot.memory.status = "pickingUp";
    } else if (bot.store.getFreeCapacity() === 0) {
      bot.memory.status = "building";
    }

    switch (bot.memory.status) {
      case "pickingUp":
        this.fetchEnergy(bot);
        break;
      case "building":
        this.buildConstructionSite(bot);
        break;
      default:
        break;
    }
  }
}

import { Bot } from "../Bot";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { config } from "config/config";

export class UpgradeBot extends Bot {
  public memory: UpgradeBotMemory;
  public parts: BotParts = config.bots.upgradeBots.parts;
  public priority: number = config.bots.upgradeBots.priority;
  public role: string = config.bots.upgradeBots.role;
  public name: string;
  public constructor(controllerId: Id<StructureController>, roomName: string, index: number) {
    super();
    this.memory = {
      role: config.bots.upgradeBots.role,
      params: {
        controllerId
      },
      room: roomName
    };
    this.name = `uB-${controllerId}-${index}`;
  }
  private upgradeController(bot: Creep): void {
    const controller = Game.getObjectById(bot.memory.params.controllerId) as StructureController;
    if (controller) {
      const upgradeResult = bot.upgradeController(controller);
      if (upgradeResult === ERR_NOT_IN_RANGE) {
        bot.moveTo(controller);
      }
    }
  }

  private checkForLinks(bot: Creep): StructureLink | undefined {
    const room = Game.rooms[bot.memory.room];
    let nearbyLink;
    if (room) {
      if (room.controller) {
        const linksInRoom = Object.keys(Memory.rooms[room.name].monitoring.structures.links).map(linkId =>
          Game.getObjectById(linkId as Id<StructureLink>)
        ) as StructureLink[];
        const linksToRecieve = linksInRoom.filter(
          link => Memory.rooms[room.name].analysis.links[link.id].mode === "receive"
        );
        linksToRecieve.forEach(link => {
          if (link.pos.inRangeTo(room.controller!.pos, 3)) {
            nearbyLink = link;
          }
        });
      }
    }
    return nearbyLink;
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
      bot.memory.status = "upgrading";
    }

    switch (bot.memory.status) {
      case "pickingUp":
        if (bot.pos.roomName !== bot.memory.room) {
          bot.moveTo(new RoomPosition(25, 25, bot.memory.room));
        } else {
          const nearbyLink = this.checkForLinks(bot);
          if (nearbyLink) {
            const withdrawResult = bot.withdraw(nearbyLink, RESOURCE_ENERGY);
            if (withdrawResult === ERR_NOT_IN_RANGE) {
              bot.moveTo(nearbyLink);
            }
          } else {
            this.fetchEnergy(bot);
          }
        }
        break;
      case "upgrading":
        this.upgradeController(bot);
        break;
      default:
        break;
    }
  }
}

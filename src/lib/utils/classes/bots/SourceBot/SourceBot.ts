import { sourceBotConfig } from "config/subconfigs/botConfig/sourceBotConfig/sourceBotConfig";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";

export class SourceBot extends Bot {
    public memory: SourceBotMemory;
    public parts: BotParts = sourceBotConfig.parts;
    public priority: number = sourceBotConfig.priority;
    public role: string = sourceBotConfig.role;
    public name: string
    constructor(sourceId: Id<Source>) {
        super();
        this.memory = {
            role: sourceBotConfig.role,
            params: {
                sourceId: sourceId
            }
        }
        this.name = `sB-${sourceId}`
    }
    public runBot(bot: Creep): void {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning"
                return
            }
        }
        if (bot.store.getFreeCapacity() > 0 || bot.getActiveBodyparts(CARRY) == 0) {
            bot.memory.status = "harvesting"
        }
        else {
            bot.memory.status = "depositing"
        }

        switch (bot.memory.status) {
            case "harvesting":
                this.harvestSource(bot)
                break;
            case "depositing":
                const transportBots = Object.values(Game.creeps).filter(transportBot => transportBot.memory.role == "transportBot")
                if (transportBots.length == 0) {
                    const spawnsInRoom = Object.values(Game.spawns).filter(spawn => spawn.room.name == bot.room.name)
                    if (spawnsInRoom.length == 1) {
                        const transferResult = bot.transfer(spawnsInRoom[0], RESOURCE_ENERGY)
                        if (transferResult == ERR_NOT_IN_RANGE) {
                            bot.moveTo(spawnsInRoom[0])
                        }
                    }
                }
                break;
            default:
                break;
        }

    }
}

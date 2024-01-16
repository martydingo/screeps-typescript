import { transportBotConfig } from "config/subconfigs/botConfig/transportBotConfig/transportBotConfig";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";

export class TransportBot extends Bot {
    public memory: TransportBotMemory;
    public parts: BotParts = transportBotConfig.parts;
    public priority: number = transportBotConfig.priority;
    public role: string = transportBotConfig.role;
    public name: string
    constructor(sourceId: Id<Source>) {
        super();
        this.memory = {
            role: transportBotConfig.role,
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
        if (bot.store.getFreeCapacity() > 0) {
            bot.memory.status = "pickingUp"
        }
        else {
            bot.memory.status = "droppingOff"
        }

        switch (bot.memory.status) {
            case "pickingUp":
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

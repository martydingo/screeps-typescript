import { sourceBotConfig } from "config/subconfigs/botConfig/sourceBotConfig/sourceBotConfig";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";

export class SourceBot extends Bot {
    public memory: SourceBotMemory;
    public parts: BotParts = sourceBotConfig.parts;
    public priority: number = sourceBotConfig.priority;
    public role: string = sourceBotConfig.role;
    public name: string
    public room: string
    constructor(sourceId: Id<Source>, room: string) {
        super();
        this.memory = {
            role: sourceBotConfig.role,
            room: room,
            params: {
                sourceId: sourceId
            },
        }
        this.name = `sB-${sourceId}`
        this.room = room
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


            // let spawnsFull: boolean[] = []
            // Object.values(Game.spawns).filter(spawn => spawn.room.name == bot.room.name).forEach((spawn) => {
            //     if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            //         spawnsFull.push(false)
            //     } else {
            //         spawnsFull.push(true)
            //     }
            // })
            // if (spawnsFull.includes(false)) {
            //     bot.memory.status = "depositing"
            // } else {
            //     bot.drop(RESOURCE_ENERGY)
            // }

        }
        switch (bot.memory.status) {
            case "harvesting":
                this.harvestSource(bot)
                break;
            case "depositing":
                const transportBots = Object.values(Game.creeps).filter((transportBot) => transportBot.memory.role === "transportBot" && transportBot.memory.room === bot.memory.room && transportBot.memory.params.pickup === null && transportBot.memory.params.dropOff === "spawns")
                if (transportBots.length > 0) {
                    bot.drop(RESOURCE_ENERGY)
                    this.harvestSource(bot)
                } else {
                    const spawnsInRoom = Object.values(Game.spawns).filter(spawn => spawn.room.name === bot.room.name)
                    if (spawnsInRoom.length > 0) {
                        this.fillSpawn(bot)
                    } else {
                        bot.drop(RESOURCE_ENERGY)
                        this.harvestSource(bot)
                    }
                }
                break;
            default:
                break;
        }

    }
}

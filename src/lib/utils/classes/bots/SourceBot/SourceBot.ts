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

    public dropIntoContainer(bot: Creep, container: StructureContainer) {

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
        const spawnTransportBots = Object.values(Game.creeps).filter((transportBot) => transportBot.memory.role === "transportBot" && transportBot.memory.room === bot.memory.room && transportBot.memory.params.pickup === null && transportBot.memory.params.dropOff === null)
        switch (bot.memory.status) {
            case "harvesting":
                const containers = Object.values(Game.structures).filter(structure => structure.structureType === "container" && structure.room.name === bot.room.name)
                let nearbyContainer: StructureContainer | undefined
                containers.forEach((container) => {
                    if (bot.pos.isNearTo(container)) {
                        nearbyContainer = container as StructureContainer
                    }
                })

                const source = Game.getObjectById(this.memory.params.sourceId) as Source
                if (nearbyContainer) {

                    if (source) {
                        if (source.energy === 0) {
                            this.repairStructure(bot, containers[0])
                        }
                    }

                    if (spawnTransportBots.length > 0) {
                        if (nearbyContainer) {
                            this.dropIntoContainer(bot, nearbyContainer)
                        } else {
                            bot.drop(RESOURCE_ENERGY)
                        }
                    }
                }
                this.harvestSource(bot)
                break;
            case "depositing":
                if (spawnTransportBots.length == 0) {
                    this.fillSpawn(bot)
                } else {
                    if (spawnTransportBots.length > 0) {
                        const containers = Object.values(Game.structures).filter(structure => structure.structureType === "container" && structure.room.name === bot.room.name)
                        let nearbyContainer: StructureContainer | null = null
                        containers.forEach((container) => {
                            if (bot.pos.isNearTo(container)) {
                                nearbyContainer = container as StructureContainer
                            }
                        })
                        if (nearbyContainer) {
                            this.dropIntoContainer(bot, nearbyContainer)
                        } else {
                            bot.drop(RESOURCE_ENERGY)
                        }
                    }
                }
                break;
            default:
                break;
        }

    }
}

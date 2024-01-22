import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";
import { log } from "lib/utils/log";

export class ExplorerBot extends Bot {
    public memory: ExplorerBotMemory;
    public parts: BotParts = config.bots.explorerBots.parts;
    public priority: number = config.bots.explorerBots.priority;
    public role: string = config.bots.explorerBots.role;
    public name: string
    constructor(roomName: string, params: { isClaiming: boolean, isReserving: boolean }) {
        super();
        Object.keys(this.parts).forEach((energyCapacityAvailableIndex) => {
            const energyCapacityAvailable = parseInt(energyCapacityAvailableIndex)
            if(params.isClaiming){
                this.parts[energyCapacityAvailable] = [...this.parts[energyCapacityAvailable], CLAIM]
            }
            if(params.isReserving){
                this.parts[energyCapacityAvailable] = [...this.parts[energyCapacityAvailable], CLAIM, CLAIM]
            }
        })

        this.memory = {
            role: config.bots.explorerBots.role,
            params: params,
            room: roomName
        }
        this.name = `eB-${roomName}`
    }


    public runBot(bot: Creep): void {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning"
                return
            }
        }

        switch (bot.memory.status) {


            case "claiming":
                break;
            case "reserving":
                break;
            case "exploring":
                break;
            default:
                break;
        }

    }
}

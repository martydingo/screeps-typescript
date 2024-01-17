import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";



export class TransportBot extends Bot {
    public memory: TransportBotMemory;
    public parts: BotParts = config.bots.transportBots.parts;
    public priority: number = config.bots.transportBots.priority;
    public role: string = config.bots.transportBots.role;
    public name: string
    constructor(roomName: string, params: { pickup?: Id<Resource<ResourceConstant>> | Id<Structure> | null, dropOff?: Id<Structure> | null }) {
        super();
        this.memory = {
            role: config.bots.transportBots.role,
            params: {
                pickup: params.pickup && params.pickup || null,
                dropOff: params.dropOff && params.dropOff|| null,
            },
            room: roomName
        }
        this.name = `tB-${roomName}`

        if(params.pickup){
            this.name = `${this.name}-${params.pickup}`
        }
        if(params.dropOff){
            this.name = `${this.name}-${params.dropOff}`
        }
    }
    public runBot(bot: Creep): void {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning"
                return
            }
        }
        if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
            bot.memory.status = "pickingUp"
        }
        else if (bot.store.getFreeCapacity() === 0){
            bot.memory.status = "droppingOff"
        }

        switch (bot.memory.status) {
            case "pickingUp":
                if(bot.memory.params.pickup != null){
                    //
                } else {
                    this.pickupEnergy(bot)
                }
                break;
                case "droppingOff":
                if(bot.memory.params.dropOff != null){
                    //
                } else {
                    this.fillSpawn(bot)
                }
                break;
            default:
                break;
        }

    }
}

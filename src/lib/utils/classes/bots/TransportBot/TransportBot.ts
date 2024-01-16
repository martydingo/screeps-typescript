import { transportBotConfig } from "config/subconfigs/botConfig/transportBotConfig/transportBotConfig";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";

export class TransportBot extends Bot {
    public memory: TransportBotMemory;
    public parts: BotParts = transportBotConfig.parts;
    public priority: number = transportBotConfig.priority;
    public role: string = transportBotConfig.role;
    public name: string
    constructor(roomName: string, params: { pickup?: Id<Resource<ResourceConstant>> | Id<Structure> | null, dropOff?: Id<Structure> | null }) {
        super();
        this.memory = {
            role: transportBotConfig.role,
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
        console.log(JSON.stringify(bot, null, 2))
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
                console.log("pickingUp-TB")
                if(bot.memory.params.pickup != null){
                    //
                } else {
                    console.log("pickingUp-TB-DroppedResource")
                    this.pickupEnergy(bot)
                }
                break;
                case "droppingOff":
                console.log("depositing-TB")
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

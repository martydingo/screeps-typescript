import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";



export class TransportBot extends Bot {
    public memory: TransportBotMemory;
    public parts: BotParts = config.bots.transportBots.parts;
    public priority: number = config.bots.transportBots.priority;
    public role: string = config.bots.transportBots.role;
    public name: string
    constructor(roomName: string, params: { pickup?: Id<Resource<ResourceConstant>> | Id<Structure> | null, dropOff?: Id<Structure> | "towers" | null }) {
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
    private fillTowers(bot: Creep){
        const towers: StructureTower[] = []
        Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.towers).forEach(towerId => {
            const tower = Game.getObjectById(towerId as Id<StructureTower>)
            if(tower){
                towers.push(tower)
            }
        })
        const nextTower = towers.sort((towerA, towerB) => towerA.store[RESOURCE_ENERGY] - towerB.store[RESOURCE_ENERGY])[0]
        if(nextTower){
            this.dropOffResource(bot, nextTower, RESOURCE_ENERGY)
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
                    if(bot.memory.params.dropOff === "towers"){
                        this.fillTowers(bot)
                    }
                } else {
                    this.fillSpawn(bot)
                }
                break;
            default:
                break;
        }

    }
}

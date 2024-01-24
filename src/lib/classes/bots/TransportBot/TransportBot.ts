import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";



export class TransportBot extends Bot {
    public memory: TransportBotMemory;
    public parts: BotParts = config.bots.transportBots.parts;
    public priority: number = config.bots.transportBots.priority;
    public role: string = config.bots.transportBots.role;
    public name: string
    constructor(roomName: string, params: { pickup?: Id<Resource<ResourceConstant>> | Id<Structure> | "loot" | null, dropOff?: Id<Structure> | "towers" | "spawns" | "links" | null }) {
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
            if(params.dropOff === "towers" || params.dropOff === "spawns" || params.dropOff === "links"){
                this.priority = this.priority + 2
            }
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

    private fillLinks(bot: Creep){
        const links = Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.links).map(linkId => Game.getObjectById(linkId as Id<StructureLink>)) as StructureLink[]
        const linksToSend = links.filter(link => Memory.rooms[bot.memory.room].analysis.links[link.id].mode === "send")
        const linkToFill = linksToSend.sort((linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY])[0]

        if(linkToFill){
            this.dropOffResource(bot, linkToFill, RESOURCE_ENERGY)
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
                    if(bot.memory.params.pickup === "loot"){
                        if(bot.pos.roomName !== bot.memory.room){
                            const droppedEnergy = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.droppedResources).sort(([, droppedResourceA], [, droppedResourceB]) => droppedResourceB.amount - droppedResourceA.amount)
                            if(droppedEnergy.length > 0){
                                bot.moveTo(Game.getObjectById(droppedEnergy[0][0] as Id<Resource<ResourceConstant>>)!)
                            } else {
                                bot.moveTo(new RoomPosition(25, 25, bot.memory.room))
                            }
                        } else {
                            this.pickupEnergy(bot)
                        }
                    }
                } else {
                    this.fetchEnergy(bot)
                }
                break;
                case "droppingOff":
                if(bot.memory.params.dropOff != null){
                    if(bot.memory.params.dropOff === "towers"){
                        this.fillTowers(bot)
                    } else if (bot.memory.params.dropOff === "spawns") {
                        this.fillSpawn(bot)
                    } else if (bot.memory.params.dropOff === "links") {
                        this.fillLinks(bot)
                    }
                    else {
                        const dropOff = Game.getObjectById(bot.memory.params.dropOff as Id<Structure>)
                        if(dropOff){
                            this.dropOffResource(bot, dropOff, RESOURCE_ENERGY)
                        }
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

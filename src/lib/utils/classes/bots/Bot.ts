import { BotParts } from "config/subconfigs/botConfig/botConfig.types"
import { log } from "lib/utils/log"

export class Bot {
    public memory = {} as BotMemory
    public parts = {} as BotParts
    constructor() {

    }
    public harvestSource(bot: Creep) {
        const source = Game.getObjectById(this.memory.params.sourceId) as Source
        if (bot.harvest(source) == ERR_NOT_IN_RANGE) {
            bot.moveTo(source)
        }
    }
    public pickupResource(bot: Creep, resource: Resource<ResourceConstant>) {
        const pickupResult = bot.pickup(resource)
        if(pickupResult === ERR_NOT_IN_RANGE){
            const moveResult = bot.moveTo(resource)
            if(moveResult !== OK){
                log.info(`${bot.name} suffered ${moveResult} while moving`)
            }
        } else if(pickupResult !== OK){
            log.info(`${bot.name} suffered ${pickupResult} while picking up`)
        }

    }
    public pickupEnergy(bot: Creep){
        const droppedEnergy = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.droppedResources).sort(([, droppedResourceA],[, droppedResourceB]) => droppedResourceA.amount - droppedResourceB.amount)
        this.pickupResource(bot, Game.getObjectById(droppedEnergy[0][0] as Id<Resource<ResourceConstant>>)!)
        console.log(Game.getObjectById(droppedEnergy[0][0] as Id<Resource<ResourceConstant>>))
    }

    public fillSpawn(bot: Creep){
        const spawnsInRoom = Object.values(Game.spawns).filter(spawn => spawn.room.name == bot.room.name)
        if (spawnsInRoom.length == 1) {
            const transferResult = bot.transfer(spawnsInRoom[0], RESOURCE_ENERGY)
            if (transferResult == ERR_NOT_IN_RANGE) {
                bot.moveTo(spawnsInRoom[0])
            }
        }
    }
}

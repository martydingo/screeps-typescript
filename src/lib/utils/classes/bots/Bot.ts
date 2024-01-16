import { BotParts } from "config/subconfigs/botConfig/botConfig.types"

export class Bot {
    public memory = {} as BotMemory
    public parts = {} as BotParts
    constructor() {
    }
    public harvestSource(creep: Creep) {
        const source = Game.getObjectById(this.memory.params.sourceId) as Source
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source)
        }
    }
}

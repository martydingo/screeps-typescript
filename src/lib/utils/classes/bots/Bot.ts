import { BotParts } from "config/subconfigs/botConfig/botConfig.types"

export class Bot {
    public memory = {} as BotMemory
    public parts = {} as BotParts
    constructor() {
    }

}

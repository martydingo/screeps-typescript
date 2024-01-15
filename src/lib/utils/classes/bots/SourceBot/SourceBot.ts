import { sourceBotConfig } from "config/subconfigs/botConfig/sourceBotConfig/sourceBotConfig";
import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";

export class SourceBot extends Bot {
    public memory: SourceBotMemory;
    public parts: BotParts = sourceBotConfig.parts;
    public priority: number = sourceBotConfig.priority;
    public role: string = sourceBotConfig.role;
    public name: string
    constructor(sourceId: Id<Source>) {
        super();
        this.memory = {
            role: sourceBotConfig.role,
            params: {
                sourceId: sourceId
            }
        }
        this.name = `sB-${sourceId}`
    }
}

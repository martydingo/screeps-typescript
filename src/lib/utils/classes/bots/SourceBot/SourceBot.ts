import { sourceBotConfig } from "config/subconfigs/botConfig/sourceBotConfig/sourceBotConfig";
import { Bot } from "../Bot";

export class SourceBot extends Bot {
    public memory: SourceBotMemory;
    public parts: BotParts = sourceBotConfig.parts;
    public name: string
    constructor(sourceId: Id<Source>) {
        super();
        this.memory = {
            role: "sourceBot",
            params: {
                sourceId: sourceId
            }
        }
        this.name = `sB-${sourceId}`
    }
}

import { BotConfiguration } from "./botConfig.types";
import { sourceBotConfig } from "./sourceBotConfig/sourceBotConfig";
import { transportBotConfig } from "./transportBotConfig/transportBotConfig";
import { upgradeBotConfig } from "./upgradeBotConfig/upgradeBotConfig";

export const botConfig: BotConfiguration = {
    sourceBots: sourceBotConfig,
    transportBots: transportBotConfig,
    upgradeBots: upgradeBotConfig
}

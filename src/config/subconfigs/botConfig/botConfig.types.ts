import { SourceBotConfiguration } from "./sourceBotConfig/sourceBotConfig.types"

export type BotParts = {
    [key: number]: BodyPartConstant[]
}

export type BotConfiguration = {
    sourceBots: SourceBotConfiguration
}

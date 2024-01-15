import { SourceBotConfiguration } from "./sourceBotConfig/sourceBotConfig.types"

export type BotParts = {
    [key: number]: BodyPartConstant[]
}

export type BotConfiguration = {
    sourceBots: SourceBotConfiguration
}

export interface GenericBotConfiguration {
    role: string
    parts: { [key: number]: BodyPartConstant[] }
    priority: number
}

import { buildBotConfiguration } from "./buildBotConfig/buildBotConfig.types"
import { ExplorerBotConfiguration } from "./explorerBotConfig/explorerBotConfig.types"
import { SourceBotConfiguration } from "./sourceBotConfig/sourceBotConfig.types"
import { transportBotConfiguration } from "./transportBotConfig/transportBotConfig.types"
import { upgradeBotConfiguration } from "./upgradeBotConfig/upgradeBotConfig.types"

export type BotParts = {
    [key: number]: BodyPartConstant[]
}

export type BotConfiguration = {
    sourceBots: SourceBotConfiguration
    transportBots: transportBotConfiguration
    upgradeBots: upgradeBotConfiguration
    buildBots: buildBotConfiguration
    explorerBots: ExplorerBotConfiguration
    [key: string]: GenericBotConfiguration
}

export interface GenericBotConfiguration {
    role: string
    parts: { [key: number]: BodyPartConstant[] }
    priority: number
}

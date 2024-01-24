import { BotConfiguration } from "./subconfigs/botConfig/botConfig.types";
import { LinkConfiguration } from "./subconfigs/linkConfig/linkConfig.types";

export {};

export type Configuration = {
    bots: BotConfiguration
    rooms: RoomConfiguration['production'|'staging'|'development']
    logging: LogConfiguration
    links: LinkConfiguration['production'|'staging'|'development']
}


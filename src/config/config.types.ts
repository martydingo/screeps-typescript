import { BotConfiguration } from "./subconfigs/botConfig/botConfig.types";
import { LinkConfiguration } from "./subconfigs/linkConfig/linkConfig.types";

export {};

export type Configuration = {
    bots: BotConfiguration
    rooms: RoomConfiguration
    logging: LogConfiguration
    links: LinkConfiguration
}


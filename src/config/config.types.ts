import { BotConfiguration } from "./subconfigs/botConfig/botConfig.types";

export {};

export type Configuration = {
    bots: BotConfiguration
    rooms: RoomConfiguration
    logging: LogConfiguration
}


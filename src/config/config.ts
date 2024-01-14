import type { Configuration } from "./config.types";
import { botConfig } from "./subconfigs/botConfig/botConfig";
import { logConfig } from "./subconfigs/logConfig/logConfig";
import { roomConfig } from "./subconfigs/roomConfig/roomConfig";

const userConfig: Configuration = {
    bots: botConfig,
    rooms: roomConfig,
    logging: logConfig
}

export const config: Configuration = {
    bots: userConfig.bots,
    rooms: userConfig.rooms,
    logging: userConfig.logging
}

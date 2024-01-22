import type { Configuration } from "./config.types";
import { botConfig } from "./subconfigs/botConfig/botConfig";
import { linkConfig } from "./subconfigs/linkConfig/linkConfig";
import { logConfig } from "./subconfigs/logConfig/logConfig";
import { roomConfig } from "./subconfigs/roomConfig/roomConfig";

const userConfig: Configuration = {
    bots: botConfig,
    rooms: roomConfig,
    logging: logConfig,
    links: linkConfig
}

export const config: Configuration = {
    bots: userConfig.bots,
    rooms: userConfig.rooms,
    logging: userConfig.logging,
    links: userConfig.links
}

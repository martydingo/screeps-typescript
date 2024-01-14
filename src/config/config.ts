import { logConfig } from "./subconfigs/logConfig/logConfig";
import { roomConfig } from "./subconfigs/roomConfig/roomConfig";

const userConfig: Configuration = {
    rooms: roomConfig,
    logging: logConfig
}

export const config: Configuration = {
    rooms: userConfig.rooms,
    logging: userConfig.logging
}

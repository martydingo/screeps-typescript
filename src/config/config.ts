import type { Configuration } from "./config.types";
import { botConfig } from "./subconfigs/botConfig/botConfig";
import { linkConfig } from "./subconfigs/linkConfig/linkConfig";
import { logConfig } from "./subconfigs/logConfig/logConfig";
import { roomConfig } from "./subconfigs/roomConfig/roomConfig";

// @ts-expect-error generatePixel is only available in production
if (Game.cpu.generatePixel) {
  global.environment = "production";
} else {
  global.environment = "development";
}

export const userConfig: Configuration = {
  bots: botConfig,
  rooms: roomConfig[global.environment],
  logging: logConfig,
  links: linkConfig[global.environment]
};

export const config: Configuration = {
  bots: userConfig.bots,
  rooms: userConfig.rooms,
  logging: userConfig.logging,
  links: userConfig.links
};

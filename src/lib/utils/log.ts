import { config } from "config/config";
import { LogVerbosity } from "config/subconfigs/logConfig/logConfig.types";

export const log = {
  debug(message: any) {
    if (config.logging.verbosity > LogVerbosity.Debug) return;
    console.log(`[LOG][DEBUG]> ${JSON.stringify(message, null, 2)}`);
  },
  info(message: any) {
    if (config.logging.verbosity > LogVerbosity.Info) return;
    console.log(`[LOG][INFO]> ${JSON.stringify(message, null, 2)}`);
  }
};

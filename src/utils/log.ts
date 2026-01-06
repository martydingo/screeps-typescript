// <font color=""> text </font>

import { config } from "config";

export enum LogSeverity {
    EMERGENCY = 0,
    ALERT = 1,
    CRITICAL = 2,
    ERROR = 3,
    WARNING = 4,
    NOTICE = 5,
    INFORMATIONAL = 6,
    DEBUG = 7,
}

const LogColors = {
  0: "#8f0b13",
  1: "#af2b33",
  2: "#cf4b53",
  3: "#ef6b73",
  4: "#ffae57",
  5: "#bae67e",
  6: "#d7dce2",
  7: "#a2aabc"
};

export function Log(serverity: LogSeverity, module: string, message: string) {
  if (serverity <= config[global.store.env].logLevel) {
    console.log(`<font color="${LogColors[serverity]}" severity="${serverity} module=${module}">${module} - ${message}</font>`);
  }
}

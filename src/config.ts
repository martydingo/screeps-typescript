import { LogSeverity } from "utils/log";

export const config: {
  roomsToMine: { [key: string]: string[] };
  roomsToClaim: { [key: string]: string[] };
  logLevel: LogSeverity;
} = {
  roomsToMine: {
    dev: [],
    prod: []
  },
  roomsToClaim: {
    dev: [],
    prod: ["E12S15"]
  },
  // EMERGENCY = 0,
  // ALERT = 1,
  // CRITICAL = 2,
  // ERROR = 3,
  // WARNING = 4,
  // NOTICE = 5,
  // INFORMATIONAL = 6,
  // DEBUG = 7,
  logLevel: 6
};

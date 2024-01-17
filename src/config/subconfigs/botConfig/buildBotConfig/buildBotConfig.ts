import { buildBotConfiguration } from "./buildBotConfig.types";
export const buildBotConfig: buildBotConfiguration = {
    role: "buildBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        500: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        550: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
    },
    priority: 4
}

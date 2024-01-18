import { buildBotConfiguration } from "./buildBotConfig.types";
export const buildBotConfig: buildBotConfiguration = {
    role: "buildBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        500: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        600: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        650: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        700: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        750: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        800: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    },
    priority: 4
}

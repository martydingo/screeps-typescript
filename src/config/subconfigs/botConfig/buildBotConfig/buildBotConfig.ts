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
        850: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        900: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        950: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1000: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1050: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1100: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1150: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1200: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1250: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1300: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    priority: 4
}

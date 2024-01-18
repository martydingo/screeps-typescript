import { transportBotConfiguration } from "./transportBotConfig.types";
export const transportBotConfig: transportBotConfiguration = {
    role: "transportBot",
    parts: {
        300: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        350: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        400: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        450: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        500: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        550: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        600: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        650: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE],
        700: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        750: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE, CARRY, MOVE, MOVE],
        800: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
    },
    priority: Object.values(Game.creeps).filter(creep => creep.memory.role === "sourceBot").length > 0 && 1 || 2,
}

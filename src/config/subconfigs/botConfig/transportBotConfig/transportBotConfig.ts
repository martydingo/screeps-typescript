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
    },
    priority: Object.values(Game.creeps).filter(creep => creep.memory.role === "sourceBot").length > 0 && 1 || 2,
}

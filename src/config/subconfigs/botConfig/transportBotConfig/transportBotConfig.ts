import { transportBotConfiguration } from "./transportBotConfig.types";
export const transportBotConfig: transportBotConfiguration = {
    role: "transportBot",
    parts: {
        1: [WORK, CARRY, MOVE],
        2: [WORK, WORK, CARRY, MOVE],
        3: [WORK, WORK, CARRY, MOVE],
        4: [WORK, WORK, CARRY, MOVE],
        5: [WORK, WORK, CARRY, MOVE],
        6: [WORK, WORK, CARRY, MOVE],
        7: [WORK, WORK, CARRY, MOVE],
        8: [WORK, WORK, CARRY, MOVE],
    },
    priority: Object.values(Game.creeps).filter(creep => creep.memory.role === "transportBot").length > 0 && 2 || 1,
}

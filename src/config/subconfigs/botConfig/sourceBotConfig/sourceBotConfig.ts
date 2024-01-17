import { SourceBotConfiguration } from "./sourceBotConfig.types";
export const sourceBotConfig: SourceBotConfiguration = {
    role: "sourceBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, WORK, CARRY, MOVE],
        450: [WORK, WORK, WORK, CARRY, MOVE, MOVE],
        500: [WORK, WORK, WORK, WORK, CARRY, MOVE],
        550: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
    },
    priority: Object.values(Game.creeps).filter(creep => creep.memory.role === "sourceBot").length > 0 && 2 || 1,
}

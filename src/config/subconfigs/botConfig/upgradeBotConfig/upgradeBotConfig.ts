import { upgradeBotConfiguration } from "./upgradeBotConfig.types";
export const upgradeBotConfig: upgradeBotConfiguration = {
    role: "upgradeBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        500: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        550: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
    },
    priority: 3
}

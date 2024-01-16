import { SourceBot } from "lib/utils/classes/bots/SourceBot/SourceBot"
import { log } from "lib/utils/log";

export function actionBots() {
    Object.values(Game.creeps).forEach(creep => {
        switch (creep.memory.role) {
            case "sourceBot":
                const sourceBot = new SourceBot(creep.memory.params.sourceId)
                sourceBot.runBot(creep)
                break;
            default:
                log.info(`Creep ${creep.name} has invalid role ${creep.memory.role}`)
                break;
        }
    })
}

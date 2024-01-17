import { SourceBot } from "lib/utils/classes/bots/SourceBot/SourceBot"
import { TransportBot } from "lib/utils/classes/bots/TransportBot/TransportBot";
import { UpgradeBot } from "lib/utils/classes/bots/UpgradeBot/UpgradeBot";
import { log } from "lib/utils/log";

export function actionBots() {
    Object.values(Game.creeps).forEach(creep => {
        switch (creep.memory.role) {
            case "sourceBot":
                const sourceBot = new SourceBot(creep.memory.params.sourceId, creep.memory.room)
                sourceBot.runBot(creep)
                break;
            case "transportBot":
                const transportBot = new TransportBot(creep.memory.room, {})
                transportBot.runBot(creep)
                break;
            case "upgradeBot":
                const upgradeBot = new UpgradeBot(creep.memory.params.controllerId, creep.memory.room)
                upgradeBot.runBot(creep)
                break;
            default:
                log.info(`Creep ${creep.name} has invalid role ${creep.memory.role}`)
                break;
        }
    })
}

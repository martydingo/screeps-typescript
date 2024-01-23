import { BuildBot } from "lib/utils/classes/bots/BuildBot/BuildBot";
import { ExplorerBot } from "lib/utils/classes/bots/ExplorerBot/ExplorerBot";
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
            case "upgradeBot":
                const upgradeBot = new UpgradeBot(creep.memory.params.controllerId, creep.memory.room)
                upgradeBot.runBot(creep)
                break;
            case "buildBot":
                const buildBot = new BuildBot(creep.memory.room, 0)
                buildBot.runBot(creep)
                break;
            case "transportBot":
                const transportBot = new TransportBot(creep.memory.room, {})
                transportBot.runBot(creep)
                break;
            case "explorerBot":
                const explorerBot = new ExplorerBot(creep.memory.room,  { isClaiming: creep.memory.params.isClaiming, isReserving: creep.memory.params.isReserving })
                explorerBot.runBot(creep)
                break;
            default:
                log.info(`Creep ${creep.name} has invalid role ${creep.memory.role}`)
                break;
        }
    })
}

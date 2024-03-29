import { BotParts } from "config/subconfigs/botConfig/botConfig.types";
import { Bot } from "../Bot";
import { config } from "config/config";

export class UpgradeBot extends Bot {
    public memory: UpgradeBotMemory;
    public parts: BotParts = config.bots.upgradeBots.parts;
    public priority: number = config.bots.upgradeBots.priority;
    public role: string = config.bots.upgradeBots.role;
    public name: string
    constructor(controllerId: Id<StructureController>, roomName: string) {
        super();
        this.memory = {
            role: config.bots.upgradeBots.role,
            params: {
                controllerId: controllerId
            },
            room: roomName
        }
        this.name = `uB-${controllerId}`
    }
    private upgradeController(bot: Creep): void {
        const controller = Game.getObjectById(bot.memory.params.controllerId) as StructureController
        if (controller) {
            const upgradeResult = bot.upgradeController(controller)
            if (upgradeResult == ERR_NOT_IN_RANGE) {
                bot.moveTo(controller)
            }
        }
    }

    public runBot(bot: Creep): void {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning"
                return
            }
        }
        if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
            bot.memory.status = "pickingUp"
        }
        else if (bot.store.getFreeCapacity() === 0){
            bot.memory.status = "upgrading"
        }

        switch (bot.memory.status) {
            case "pickingUp":
                this.pickupEnergy(bot)
                break;
            case "upgrading":
                this.upgradeController(bot)
                break;
            default:
                break;
        }

    }
}

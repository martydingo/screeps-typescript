export { }

declare global {
    type UpgradeBotParams = {
        controllerId: Id<StructureController>
    }
    interface UpgradeBotMemory extends BotMemory {
        params: UpgradeBotParams
    }
}

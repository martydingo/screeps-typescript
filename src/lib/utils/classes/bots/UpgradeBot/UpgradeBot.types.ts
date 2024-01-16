export { }

declare global {
    type UpgradeBotParams = {
        pickup: Id<Resource<ResourceConstant>> | Id<Structure> | null
        dropOff: Id<Structure> | null
    }
    interface UpgradeBotMemory extends BotMemory {
        params: UpgradeBotParams
    }
}

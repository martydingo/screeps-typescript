export { }

declare global {
    type TransportBotParams = {
        pickup: Id<Resource<ResourceConstant>> | Id<Structure> |  null
        dropOff: Id<Structure> | "towers" | null
    }
    interface TransportBotMemory extends BotMemory {
        params: TransportBotParams
    }
}

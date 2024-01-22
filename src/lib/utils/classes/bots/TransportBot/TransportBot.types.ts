export { }

declare global {
    type TransportBotParams = {
        pickup: Id<Resource<ResourceConstant>> | Id<Structure> | "loot" |  null
        dropOff: Id<Structure> | "towers" | "spawns" | null
    }
    interface TransportBotMemory extends BotMemory {
        params: TransportBotParams
    }
}

export { }

declare global {
    type TransportBotParams = {
        pickup: Id<Resource<ResourceConstant>> | Id<Structure> | "loot" |  null
        dropOff: Id<Structure> | "towers" | "spawns" | "links" | null
    }
    interface TransportBotMemory extends BotMemory {
        params: TransportBotParams
    }
}
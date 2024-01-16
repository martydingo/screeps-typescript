export { }

declare global {
    type TransportBotParams = {
        sourceId: Id<Source>
    }
    interface TransportBotMemory extends BotMemory {
        params: TransportBotParams
    }
}

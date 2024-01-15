export { }

declare global {
    type SourceBotParams = {
        sourceId: Id<Source>
    }
    interface SourceBotMemory extends BotMemory {
        params: SourceBotParams
    }
}

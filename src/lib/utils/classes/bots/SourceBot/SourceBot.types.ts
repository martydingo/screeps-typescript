export { }

declare global {
    type SourceBotParams = {
        sourceId: Id<Source>
    }
    interface SourceBotMemory extends BotMemory {
        role: "sourceBot"
        params: SourceBotParams
    }
}

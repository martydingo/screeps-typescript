export {};

declare global {
  interface SourceBotParams {
    sourceId: Id<Source>;
  }
  interface SourceBotMemory extends BotMemory {
    params: SourceBotParams;
  }
}

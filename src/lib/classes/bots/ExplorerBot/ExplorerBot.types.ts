export {};

declare global {
  interface ExplorerBotParams {
    isClaiming: boolean;
    isReserving: boolean;
  }
  type ExplorerBotMemory = BotMemory;
}

export {};

declare global {
  interface UpgradeBotParams {
    controllerId: Id<StructureController>;
  }
  interface UpgradeBotMemory extends BotMemory {
    params: UpgradeBotParams;
  }
}

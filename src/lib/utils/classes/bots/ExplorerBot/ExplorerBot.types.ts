export { }

declare global {
    type ExplorerBotParams = {
        isClaiming: boolean
        isReserving: boolean
    }
    interface ExplorerBotMemory extends BotMemory {
    }
}

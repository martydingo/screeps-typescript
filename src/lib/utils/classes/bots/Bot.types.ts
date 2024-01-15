export { }

declare global {
    interface BotMemory {
        role: string
        params: any
    }
    interface CreepMemory extends BotMemory { }
}

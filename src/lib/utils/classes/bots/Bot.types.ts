export { }

declare global {
    interface BotMemory extends CreepMemory {
        role: string
        params: any
    }
}

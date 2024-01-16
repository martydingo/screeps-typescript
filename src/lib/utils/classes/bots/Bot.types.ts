export { }

declare global {
    interface BotMemory {
        role: string
        params: any
        status?: string
    }
    interface CreepMemory extends BotMemory { }
}

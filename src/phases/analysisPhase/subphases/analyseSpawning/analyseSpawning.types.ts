export { }
declare global {
    type SpawnQueueEntry = {
        name: string
        parts: BodyPartConstant[]
        memory: BotMemory
    }

    type SpawnQueueData = {
        [key: string]: SpawnQueueEntry
    }
}

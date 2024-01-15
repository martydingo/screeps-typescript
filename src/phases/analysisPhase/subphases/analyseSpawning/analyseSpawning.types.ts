export { }
declare global {
    type SpawnQueueEntry = {
        name: string
        room: string | { spawnRoom: string, botRoom: string }
        priority: number
        parts: BodyPartConstant[]
        memory: BotMemory
    }

    type SpawnQueueData = {
        [key: string]: SpawnQueueEntry
    }
}

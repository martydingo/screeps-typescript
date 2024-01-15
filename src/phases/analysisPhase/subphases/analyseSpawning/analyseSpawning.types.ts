export { }
declare global {
    type SpawnQueueEntry = {
        name: string
        room: string | { spawnRoom: string, botRoom: string }
        priority: number
        parts: BodyPartConstant[]
        memory: BotMemory
        status: string
    }

    type SpawnQueueData = {
        [key: string]: SpawnQueueEntry
    }
}

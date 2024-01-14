export { }

declare global {
    interface AnalysisMemory {
        queues: {
            spawn: SpawnQueueData
        }
    }
    interface Memory {
        analysis: AnalysisMemory
    }
}

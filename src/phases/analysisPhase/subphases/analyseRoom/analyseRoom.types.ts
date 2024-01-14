export { }
declare global {
    type RoomAnalysisData = {
        sources: SourceAnalysisData
    }

    interface RoomMemory {
        analysis: RoomAnalysisData
    }
}

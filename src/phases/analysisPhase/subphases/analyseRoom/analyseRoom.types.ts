export { }
declare global {
    type RoomAnalysisData = {
        sources: SourceAnalysisData
        controller: ControllerAnalysisData
    }

    interface RoomMemory {
        analysis: RoomAnalysisData
    }
}

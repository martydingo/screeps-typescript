export { }
declare global {
    type RoomAnalysisData = {
        sources: SourceAnalysisData
        controller: ControllerAnalysisData
        links: LinkAnalysisData
    }

    interface RoomMemory {
        analysis: RoomAnalysisData
    }
}

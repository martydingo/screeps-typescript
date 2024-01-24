export {};
declare global {
  interface RoomAnalysisData {
    sources: SourceAnalysisData;
    controller: ControllerAnalysisData;
    links: LinkAnalysisData;
  }

  interface RoomMemory {
    analysis: RoomAnalysisData;
  }
}

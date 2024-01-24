export {};

declare global {
  interface SourceAnalysisEntry {
    assignedBot: string | null;
  }
  interface SourceAnalysisData {
    [sourceId: Id<Source>]: SourceAnalysisEntry;
  }
}

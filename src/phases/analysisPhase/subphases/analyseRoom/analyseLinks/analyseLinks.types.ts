export {};

declare global {
  interface LinkAnalysisEntry {
    mode: "send" | "receive" | "both";
  }

  interface LinkAnalysisData {
    [key: Id<StructureLink>]: LinkAnalysisEntry;
  }
}

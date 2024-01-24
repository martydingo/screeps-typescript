export {};

declare global {
  interface ConstructionMonitorEntry {
    progress: number;
    progressTotal: number;
    structureType: BuildableStructureConstant;
  }

  interface ConstructionMonitorData {
    [key: Id<ConstructionSite>]: ConstructionMonitorEntry;
  }
}

export {};

declare global {
  interface SourceMonitorEntry {
    energy: number;
    energyCapacity: number;
    regenTime: number;
  }

  interface SourceMonitorData {
    [sourceId: Id<Source>]: SourceMonitorEntry;
  }
}

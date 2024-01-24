export {};
declare global {
  interface RoadMonitorEntry {
    hits: number;
    hitsMax: number;
    decayTime: number;
  }

  interface RoadMonitorData {
    [key: Id<StructureRoad>]: RoadMonitorEntry;
  }
}

export {};
declare global {
  interface TowerMonitorEntry {
    energy: number;
  }

  interface TowerMonitorData {
    [key: Id<StructureTower>]: TowerMonitorEntry;
  }
}

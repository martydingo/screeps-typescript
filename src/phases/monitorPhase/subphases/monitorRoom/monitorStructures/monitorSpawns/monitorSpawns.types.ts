export {};

declare global {
  interface SpawnMonitorEntry {
    energy: number;
    energyCapacity: number;
    spawning: number;
  }

  interface SpawnMonitorData {
    [key: Id<StructureSpawn>]: SpawnMonitorEntry;
  }
}

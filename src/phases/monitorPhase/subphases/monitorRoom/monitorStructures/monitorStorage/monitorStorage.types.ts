export {};
declare global {
  interface StorageMonitorEntry {
    contents: StoreDefinition;
  }

  interface StorageMonitorData {
    [key: Id<StructureStorage>]: StorageMonitorEntry;
  }
}

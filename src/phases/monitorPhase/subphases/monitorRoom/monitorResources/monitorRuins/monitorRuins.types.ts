export {};
declare global {
  interface RuinMonitorEntry {
    contents: StoreDefinition;
  }

  interface RuinMonitorData {
    [key: Id<Ruin>]: RuinMonitorEntry;
  }
}

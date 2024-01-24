export {};
declare global {
  interface ContainerMonitorEntry {
    hits: number;
    hitsMax: number;
    contents: StoreDefinition;
    decayTime: number;
  }

  interface ContainerMonitorData {
    [key: Id<StructureContainer>]: ContainerMonitorEntry;
  }
}

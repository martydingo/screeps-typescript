export {};

declare global {
  interface ExtensionMonitorEntry {
    energy: number;
    energyCapacity: number;
  }

  interface ExtensionMonitorData {
    [key: Id<StructureExtension>]: ExtensionMonitorEntry;
  }
}

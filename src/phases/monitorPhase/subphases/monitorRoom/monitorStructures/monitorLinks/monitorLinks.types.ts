export {};

declare global {
  interface LinkMonitorEntry {
    energy: number;
    energyCapacity: number;
    // mode: "send" | "receive" | "both"
    cooldown: number;
  }

  interface LinkMonitorData {
    [key: Id<StructureLink>]: LinkMonitorEntry;
  }
}

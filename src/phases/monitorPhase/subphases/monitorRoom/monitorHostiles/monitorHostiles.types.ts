export {};

declare global {
  interface HostileMonitorEntry {
    hits: number;
    hitsMax: number;
    parts: BodyPartConstant[];
    owner: string;
  }

  interface HostileMonitorData {
    [id: Id<Creep>]: HostileMonitorEntry;
  }
}

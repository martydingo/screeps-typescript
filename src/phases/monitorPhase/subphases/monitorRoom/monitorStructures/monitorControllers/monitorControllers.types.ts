export {};
declare global {
  interface ControllerMonitorEntry {
    progress: number;
    nextLevel: number;
    rcl: number;
    downgrade: number;
    safeMode: number | null;
  }

  interface ControllerMonitorData {
    [key: Id<StructureController>]: ControllerMonitorEntry;
  }
}

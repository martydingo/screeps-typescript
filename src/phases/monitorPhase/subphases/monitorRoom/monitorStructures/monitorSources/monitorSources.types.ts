export { };

declare global {
    type SourceMonitorEntry = {
        energy: number;
        energyCapacity: number;
        regenTime: number;
    }

    type SourceMonitorData = {
        [sourceId: Id<Source>]: SourceMonitorEntry;
    }
}

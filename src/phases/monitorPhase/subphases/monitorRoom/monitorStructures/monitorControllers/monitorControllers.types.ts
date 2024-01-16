export {}
declare global {
    type ControllerMonitorEntry = {
        progress: number
        nextLevel: number
        rcl: number
        downgrade: number
        safeMode: number | null
    }

    type ControllerMonitorData = {
        [key: Id<StructureController>]: ControllerMonitorEntry
    }
}

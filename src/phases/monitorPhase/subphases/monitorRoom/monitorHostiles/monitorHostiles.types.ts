export { }

declare global {
    type HostileMonitorEntry = {
        hits: number
        hitsMax: number
        parts: BodyPartConstant[]
        owner: string
    }

    type HostileMonitorData = {
        [id: Id<Creep>]: HostileMonitorEntry
    }
}

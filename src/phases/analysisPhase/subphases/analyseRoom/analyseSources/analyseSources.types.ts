export { }

declare global {
    type SourceAnalysisEntry = {
        assignedBot: Id<Bot> | null
    }
    type SourceAnalysisData = {
        [sourceId: Id<Source>]: SourceAnalysisEntry
    }
}

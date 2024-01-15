export { }

declare global {
    type SourceAnalysisEntry = {
        assignedBot: string | null
    }
    type SourceAnalysisData = {
        [sourceId: Id<Source>]: SourceAnalysisEntry
    }
}

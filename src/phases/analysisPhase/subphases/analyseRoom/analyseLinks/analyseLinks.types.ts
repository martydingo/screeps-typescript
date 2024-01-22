export {}

declare global {
    type LinkAnalysisEntry = {
        mode: "send" | "receive" | "both"
    }

    type LinkAnalysisData = {
        [key: Id<StructureLink>]: LinkAnalysisEntry
    }
}

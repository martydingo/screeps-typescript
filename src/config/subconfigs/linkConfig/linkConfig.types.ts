type LinkConfigurationEntry = {
    mode: "send" | "receive" | "both"

}

export type LinkConfiguration = {
    [environment: string]: {
        [key: Id<StructureLink> | string]: LinkConfigurationEntry
    }
}

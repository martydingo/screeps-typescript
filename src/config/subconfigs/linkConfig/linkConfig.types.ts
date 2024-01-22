type LinkConfigurationEntry = {
    mode: "send" | "receive" | "both"

}

export type LinkConfiguration = {
    [key: Id<StructureLink> | string]: LinkConfigurationEntry
}

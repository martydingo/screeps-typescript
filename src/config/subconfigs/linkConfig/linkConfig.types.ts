interface LinkConfigurationEntry {
  mode: "send" | "receive" | "both";
}

export interface LinkConfiguration {
  [environment: string]: {
    [key: Id<StructureLink> | string]: LinkConfigurationEntry;
  };
}

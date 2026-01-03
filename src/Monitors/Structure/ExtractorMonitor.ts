import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface ExtractorMonitorMemory {
  [key: string]: {
    mineral: {
      id: Id<Mineral>
      type: MineralConstant;
      amount: number;
      density: number;
      regeneration: number;
    };
    cooldown: number;
  };
}

@profileClass()
export class ExtractorMonitor {
  public constructor(extractor: StructureExtractor) {
    if (!extractor.room.memory.structures!.extractor) {
      extractor.room.memory.structures!.extractor = {};
      Log(
        LogSeverity.DEBUG,
        "ExtractorMonitor",
        `Extractor monitor memory not found, Extractor monitor memory initialised.`
      );
    }



    const mineral = extractor.pos
    .look()
    .filter(lookResult => lookResult.type === "mineral")
    .map(mineralResult => mineralResult.mineral!)[0];


    extractor.room.memory.structures!.extractor[extractor.id] = {
    mineral: {
      id: mineral.id,
      type: mineral.mineralType,
      amount: mineral.mineralAmount,
      density: mineral.density,
        regeneration: mineral.ticksToRegeneration || 0,
    },
      cooldown: extractor.cooldown,
      // mineral: ""
    };
    Log(LogSeverity.DEBUG, "ExtractorMonitor", `extractor ${extractor.id}} monitored.`);
  }
}

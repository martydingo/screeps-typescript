import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface SourceCreepMemory extends CreepMemoryTemplate {
    assignedSource: Id<Source>
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CreepMemory extends Partial<SourceCreepMemory> { }
}

export class SourceCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 1, carry: 0, move: 1 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "SourceCreep")
      .forEach(sourceCreep => {
        if (sourceCreep.memory.curTask === "spawning" && sourceCreep.spawning === false) {
          sourceCreep.memory.curTask = "miningSource";
        }

        if (sourceCreep.memory.curTask === "miningSource") {
          sourceCreep.mineSource(sourceCreep.memory.assignedSource!);
          if (sourceCreep.store[RESOURCE_ENERGY] > 0) {
            sourceCreep.drop(RESOURCE_ENERGY);
          }
        }
      });
  }
}

import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface SourceCreepMemory extends CreepMemoryTemplate {
    assignedSource: Id<Source>
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CreepMemory extends Partial<SourceCreepMemory> { }
}

export class SourceCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 0.1, move: 1 };
  public static maxBodyParts = { work: 7, carry: 1, move: 8 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "SourceCreep")
      .forEach(sourceCreep => {
        if (sourceCreep.memory.curTask === "spawning" && sourceCreep.spawning === false) {
          sourceCreep.memory.curTask = "miningSource";
        }

        if (sourceCreep.memory.curTask === "miningSource") {
          const assignedSource = sourceCreep.memory.assignedSource
          if (Game.flags[`anchor-${assignedSource as string}`]) {
            const anchorPoint = Game.flags[`anchor-${assignedSource as string}`]
            if (sourceCreep.pos !== anchorPoint.pos) {
              sourceCreep.moveTo(anchorPoint.pos)
            }
          }
          sourceCreep.mineSource(sourceCreep.memory.assignedSource!);
          if (sourceCreep.store[RESOURCE_ENERGY] > 0) {
            if (sourceCreep.room.storage) {
              const transferResult = sourceCreep.transfer(sourceCreep.room.storage, RESOURCE_ENERGY)
              if (transferResult !== OK) {
                sourceCreep.drop(RESOURCE_ENERGY);
              }
            } else {
              sourceCreep.drop(RESOURCE_ENERGY);
            }
          }
        }
      });
  }
}

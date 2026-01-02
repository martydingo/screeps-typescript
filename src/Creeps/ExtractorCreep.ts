import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface ExtractorCreepMemory extends CreepMemoryTemplate {
  assignedExtractor: Id<StructureExtractor>;
  assignedContainer: Id<StructureContainer>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ExtractorCreepMemory> {}
}

export class ExtractorCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 1, move: 2 };
  public static maxBodyParts = { work: 6, carry: 1, move: 8 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "ExtractorCreep")
      .forEach(extractorCreep => {
        if (extractorCreep.memory.curTask === "spawning" && extractorCreep.spawning === false) {
          extractorCreep.memory.curTask = "miningExtractor";
          Log(LogSeverity.DEBUG, "ExtractorCreep", `${extractorCreep.name} has spawned, task set to "miningExtractor"`);
        }

        if (extractorCreep.memory.curTask === "miningExtractor") {
          let shouldMine = false;
          const assignedExtractor = extractorCreep.memory.assignedExtractor;
          if (Game.flags[`extractor-anchor-${assignedExtractor as string}`]) {
            const anchorPoint = Game.flags[`extractor-anchor-${assignedExtractor as string}`];
            if (extractorCreep.pos.getRangeTo(anchorPoint.pos) > 0) {
              const moveResult = extractorCreep.moveTo(anchorPoint.pos);
              if (moveResult === OK) {
                Log(
                  LogSeverity.DEBUG,
                  "ExtractorCreep",
                  `${extractorCreep.name} has moved towards anchor ${anchorPoint.name}`
                );
              } else {
                Log(
                  LogSeverity.DEBUG,
                  "ExtractorCreep",
                  `${extractorCreep.name} has failed to move towards anchor ${anchorPoint.name} with result: ${moveResult}`
                );
              }
            } else {
              shouldMine = true;
            }
          } else {
            shouldMine = true;
          }
          if (shouldMine === true) {
            const harvestResult = this.mineExtractor(extractorCreep);
          }
        }
      });
  }

  private mineExtractor(extractorCreep: Creep) {
    const room = Game.rooms[extractorCreep.memory.room!];
    if (room) {
      const structureMonitorMemory = room.memory.structures;
      if (structureMonitorMemory) {
        const extractorMonitorMemory = structureMonitorMemory.extractor;
        if (extractorMonitorMemory) {
          const extractorId = extractorCreep.memory.assignedExtractor!;
          const extractor = Game.getObjectById(extractorId)
          const mineralId = extractorMonitorMemory[extractorId].mineral.id;
          const mineral = Game.getObjectById(mineralId);
          if (mineral && extractor) {
            if (extractor.cooldown === 0) {
              const harvestResult = extractorCreep.harvest(mineral);
              if (harvestResult === ERR_NOT_IN_RANGE) {
                const moveResult = extractorCreep.moveTo(mineral);
                if (moveResult === OK) {
                  Log(
                    LogSeverity.DEBUG,
                    "SpawnCreep",
                    `${extractorCreep.name} is not in range of mineral ${mineral.id} in ${mineral.pos.roomName}, and has moved closer.`
                  );
                } else {
                  Log(
                    LogSeverity.ERROR,
                    "SpawnCreep",
                    `${extractorCreep.name} is not in range of mineral ${mineral.id} in ${mineral.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
                  );
                }
              } else if (harvestResult === OK) {
                const container = Game.getObjectById(extractorCreep.memory.assignedContainer as Id<StructureContainer>);
                if (container) {
                  const depositResult = extractorCreep.depositResourceIntoStructure(container, mineral.mineralType);
                  if (depositResult === OK) {
                    Log(
                      LogSeverity.DEBUG,
                      "SpawnCreep",
                      `${extractorCreep.name} has harvested mineral ${mineral.mineralType} from ${mineral.id} in ${mineral.pos.roomName}, and deposited into a container`
                    );
                  } else {
                    Log(
                      LogSeverity.ERROR,
                      "SpawnCreep",
                      `${extractorCreep.name} has harvested mineral ${mineral.mineralType} from mineral ${mineral.id} in ${mineral.pos.roomName}, but failed to deposit into a container with result: ${depositResult}`
                    );
                  }
                }
              } else {
                Log(
                  LogSeverity.ERROR,
                  "SpawnCreep",
                  `${extractorCreep.name} has failed to harvest mineral ${mineral.mineralType} from mineral ${mineral.id} in ${mineral.pos.roomName} with result: ${harvestResult}`
                );
              }
            }
          }
        }
      }
    }
  }
}

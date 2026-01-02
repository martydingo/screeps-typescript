import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface SpawnCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
  assignedInfrastructure?: Id<StructureSpawn> | Id<StructureExtension> | Id<StructureTower>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<SpawnCreepMemory> {}
}

export class SpawnCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "SpawnCreep")
      .forEach(spawnCreep => {
        if (spawnCreep.memory.curTask === "spawning" && spawnCreep.spawning === false) {
          spawnCreep.memory.curTask = "fetchingEnergy";
          Log(LogSeverity.DEBUG, "SpawnCreep", `${spawnCreep.name} has spawned, task set to "fetchingEnergy"`);
        }
        if (spawnCreep.memory.curTask === "fetchingEnergy") {
          if (spawnCreep.store[RESOURCE_ENERGY] >= spawnCreep.store.getCapacity(RESOURCE_ENERGY)) {
            spawnCreep.memory.curTask = "feedingSpawns";
            Log(LogSeverity.DEBUG, "SpawnCreep", `${spawnCreep.name}'s store is full, task set to "feedingSpawns"`);
          }
        } else {
          if (spawnCreep.store[RESOURCE_ENERGY] === 0) {
            spawnCreep.memory.curTask = "fetchingEnergy";
            Log(LogSeverity.DEBUG, "SpawnCreep", `${spawnCreep.name}'s store is empty, task set to "fetchingEnergy"`);
          }
        }

        switch (spawnCreep.memory.curTask) {
          case "fetchingEnergy":
            spawnCreep.fetchEnergy();
            break;
          case "feedingSpawns":
            this.feedSpawns(spawnCreep);
        }
      });
  }

  private feedSpawns(spawnCreep: Creep) {
    this.discernInfrastructureToFeed(spawnCreep);
    this.feedInfrastructure(spawnCreep)
  }

  private discernInfrastructureToFeed(spawnCreep: Creep) {
    if (!spawnCreep.memory.assignedInfrastructure) {
      const spawnsToFeed = Object.values(Game.spawns).filter(
        spawn =>
          spawn.room.name === spawnCreep.memory.assignedRoom &&
          spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY)
      );
      let extensionsToFeed: StructureExtension[] = [];
      let towersToFeed: StructureTower[] = [];
      const structureData = Memory.rooms[spawnCreep.memory.assignedRoom!].structures;
      if (structureData) {
        if (structureData.extensions) {
          extensionsToFeed = Object.keys(structureData.extensions)
            .map(extensionId => Game.getObjectById(extensionId as Id<StructureExtension>) as StructureExtension)
            .sort((extensionA, extensionB) => {
              if (spawnCreep.pos.getRangeTo(extensionA) - spawnCreep.pos.getRangeTo(extensionB) === 0) {
                return spawnCreep.pos.getRangeTo(extensionA) - 1 - spawnCreep.pos.getRangeTo(extensionB);
              } else {
                return spawnCreep.pos.getRangeTo(extensionA) - spawnCreep.pos.getRangeTo(extensionB);
              }
            })
            .filter(extension => extension.store[RESOURCE_ENERGY] < extension.store.getCapacity(RESOURCE_ENERGY));
        }
        if (structureData.towers) {
          towersToFeed = Object.keys(structureData.towers)
            .map(towerId => Game.getObjectById(towerId as Id<StructureTower>) as StructureTower)
            .filter(tower => tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY) / 2);
        }
      }

      if (towersToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = towersToFeed[0].id;
      } else if (extensionsToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = extensionsToFeed[0].id;
      } else if (spawnsToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = spawnsToFeed[0].id;
      }
    }
  }
  private feedInfrastructure(spawnCreep: Creep) {
    const infrastructureId = spawnCreep.memory.assignedInfrastructure;
    if (infrastructureId) {
      const infrastructure = Game.getObjectById(
        spawnCreep.memory.assignedInfrastructure as Id<StructureSpawn> | Id<StructureExtension> | Id<StructureTower>
      );
      if (infrastructure) {
        const transferResult = spawnCreep.transfer(infrastructure, RESOURCE_ENERGY);
        if (transferResult === ERR_NOT_IN_RANGE) {
          const moveResult = spawnCreep.moveTo(infrastructure);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${spawnCreep.name} is not in range of ${infrastructure.structureType} ${infrastructure.id} in ${infrastructure.pos.roomName}, and has moved closer.`
            );
            return moveResult;
          } else {
            Log(
              LogSeverity.ERROR,
              "SpawnCreep",
              `${spawnCreep.name} is not in range of ${infrastructure.structureType} ${infrastructure.id} in ${infrastructure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
            return moveResult;
          }
        } else if (transferResult === OK) {
          delete spawnCreep.memory.assignedInfrastructure
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${spawnCreep.name} has deposited energy into ${infrastructure.structureType} ${infrastructure.id} in ${infrastructure.pos.roomName}`
          );
          return transferResult;
        } else {
          Log(
            LogSeverity.ERROR,
            "SpawnCreep",
            `${spawnCreep.name} has failed to deposit energy into ${infrastructure.structureType} ${infrastructure.id} in ${infrastructure.pos.roomName} with result: ${transferResult}`
          );
          return transferResult;
        }
      } else {
        Log(LogSeverity.DEBUG, "SpawnCreep", `${spawnCreep.name} currently idle.`);
        return OK;
      }
    } else {
      return ERR_NOT_FOUND
    }
  }
}

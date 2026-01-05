import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface SpawnCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
  assignedInfrastructure?:
    | Id<StructureSpawn>
    | Id<StructureExtension>
    | Id<StructureTower>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<SpawnCreepMemory> {}
}

@profileClass()
export class SpawnCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  public static run() {
    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "SpawnCreep")
      .forEach(spawnCreep => {
        if (spawnCreep.memory.curTask === "spawning" && spawnCreep.spawning === false) {
          spawnCreep.memory.curTask = "fetchingEnergy";
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${spawnCreep.name} has spawned, task set to "fetchingEnergy"`
          );
        }
        if (spawnCreep.spawning) return;
        if (spawnCreep.memory.curTask === "fetchingEnergy") {
          if (
            spawnCreep.store[RESOURCE_ENERGY] >=
            spawnCreep.store.getCapacity(RESOURCE_ENERGY)
          ) {
            spawnCreep.memory.curTask = "feedingSpawns";
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${spawnCreep.name}'s store is full, task set to "feedingSpawns"`
            );
          }
        } else {
          if (spawnCreep.store[RESOURCE_ENERGY] === 0) {
            spawnCreep.memory.curTask = "fetchingEnergy";
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${spawnCreep.name}'s store is empty, task set to "fetchingEnergy"`
            );
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

  @profileMethod
  private static feedSpawns(spawnCreep: Creep) {
    this.discernInfrastructureToFeed(spawnCreep);
    this.feedInfrastructure(spawnCreep);
  }

  @profileMethod
  private static discernInfrastructureToFeed(spawnCreep: Creep) {
    if (!spawnCreep.memory.assignedInfrastructure) {
      const curAssignedIds = Object.values(Game.creeps)
        .filter(
          creep =>
            creep.memory.type === "spawnCreep" &&
            creep.memory.assignedRoom === spawnCreep.memory.assignedRoom &&
            creep.memory.assignedInfrastructure
        )
        .map(otherSpawnCreep => otherSpawnCreep.memory.assignedInfrastructure!);

      const spawnsToFeed = Object.values(Game.spawns).filter(
        spawn =>
          spawn.room.name === spawnCreep.memory.assignedRoom &&
          spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY) &&
          !curAssignedIds.includes(spawn.id)
      );
      let extensionsToFeed: StructureExtension[] = [];
      let towersToFeed: StructureTower[] = [];
      const structureData = Memory.rooms[spawnCreep.memory.assignedRoom!].structures;
      if (structureData) {
        if (structureData.extensions) {
          extensionsToFeed = Object.keys(structureData.extensions)
            .map(
              extensionId =>
                Game.getObjectById(
                  extensionId as Id<StructureExtension>
                ) as StructureExtension
            )
            .sort((extensionA, extensionB) => {
              if (
                spawnCreep.pos.getRangeTo(extensionA) -
                  spawnCreep.pos.getRangeTo(extensionB) ===
                0
              ) {
                return (
                  spawnCreep.pos.getRangeTo(extensionA) -
                  1 -
                  spawnCreep.pos.getRangeTo(extensionB)
                );
              } else {
                return (
                  spawnCreep.pos.getRangeTo(extensionA) -
                  spawnCreep.pos.getRangeTo(extensionB)
                );
              }
            })
            .filter(
              extension =>
                extension.store[RESOURCE_ENERGY] <
                  extension.store.getCapacity(RESOURCE_ENERGY) &&
                !curAssignedIds.includes(extension.id)
            );
        }
        if (structureData.towers) {
          towersToFeed = Object.keys(structureData.towers)
            .map(
              towerId =>
                Game.getObjectById(towerId as Id<StructureTower>) as StructureTower
            )
            .sort(
              (towerA, towerB) =>
                towerA.store[RESOURCE_ENERGY] - towerB.store[RESOURCE_ENERGY]
            )
            .filter(
              tower =>
                tower.store[RESOURCE_ENERGY] <
                  tower.store.getCapacity(RESOURCE_ENERGY) &&
                !curAssignedIds.includes(tower.id)
            );
        }
      }

      if (spawnsToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = spawnsToFeed[0].id;
      } else if (extensionsToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = extensionsToFeed[0].id;
      } else if (towersToFeed.length > 0) {
        spawnCreep.memory.assignedInfrastructure = towersToFeed[0].id;
      }
    }
  }
  @profileMethod
  private static feedInfrastructure(spawnCreep: Creep) {
    const infrastructureId = spawnCreep.memory.assignedInfrastructure;
    if (infrastructureId) {
      const infrastructure = Game.getObjectById(
        spawnCreep.memory.assignedInfrastructure as
          | Id<StructureSpawn>
          | Id<StructureExtension>
          | Id<StructureTower>
      );
      if (infrastructure) {
        const infrastructureDistance = spawnCreep.pos.getRangeTo(infrastructure);
        if (infrastructureDistance >= 2) {
          const moveResult = spawnCreep.moveTo(infrastructure);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${spawnCreep.name} is not in range of infrastructure ${infrastructure.id} in ${infrastructure.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${spawnCreep.name} is not in range of infrastructure ${infrastructure.id} in ${infrastructure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
          if (spawnCreep.pos.getRangeTo(infrastructure) > 1) return moveResult;
        }
        const transferResult = spawnCreep.transfer(infrastructure, RESOURCE_ENERGY);
        if (transferResult === OK) {
          delete spawnCreep.memory.assignedInfrastructure;
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${spawnCreep.name} has deposited energy into ${infrastructure.structureType} ${infrastructure.id} in ${infrastructure.pos.roomName}.`
          );
          return transferResult;
        } else if (transferResult === ERR_FULL) {
          delete spawnCreep.memory.assignedInfrastructure;
          Log(
            LogSeverity.WARNING,
            "SpawnCreep",
            `${spawnCreep.name} has suffered an exception removing it's assignedInfrastructure, and attempted to fill and already full structure, thus assignedInfrastructure has been cleared.`
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
      return ERR_NOT_FOUND;
    }
  }
}

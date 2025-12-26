import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface SpawnCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
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
          .sort(
            (extensionA, extensionB) => spawnCreep.pos.getRangeTo(extensionA) - spawnCreep.pos.getRangeTo(extensionB)
          )
          .filter(extension => extension.store[RESOURCE_ENERGY] < extension.store.getCapacity(RESOURCE_ENERGY));
      }
      if (structureData.towers) {
        towersToFeed = Object.keys(structureData.towers)
          .map(towerId => Game.getObjectById(towerId as Id<StructureTower>) as StructureTower)
          .filter(tower => tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY));
      }
    }

    if (spawnsToFeed.length === 0) {
      if (extensionsToFeed.length === 0) {
        if (towersToFeed.length > 0) {
          const transferResult = spawnCreep.transfer(towersToFeed[0], RESOURCE_ENERGY);
          if (transferResult === ERR_NOT_IN_RANGE) {
            const moveResult = spawnCreep.moveTo(towersToFeed[0]);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "SpawnCreep",
                `${spawnCreep.name} is not in range of tower ${towersToFeed[0].id} in ${towersToFeed[0].pos.roomName}, and has moved closer.`
              );
              return moveResult;
            } else {
              Log(
                LogSeverity.ERROR,
                "SpawnCreep",
                `${spawnCreep.name} is not in range of tower ${towersToFeed[0].id} in ${towersToFeed[0].pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
              return moveResult;
            }
          } else if (transferResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${spawnCreep.name} has deposited energy into tower ${towersToFeed[0].id} in ${towersToFeed[0].pos.roomName}`
            );
            return transferResult;
          } else {
            Log(
              LogSeverity.ERROR,
              "SpawnCreep",
              `${spawnCreep.name} has failed to deposit energy into tower ${towersToFeed[0].id} in ${towersToFeed[0].pos.roomName} with result: ${transferResult}`
            );
            return transferResult;
          }
        }
        Log(LogSeverity.DEBUG, "SpawnCreep", `${spawnCreep.name} currently idle.`);
        return OK;
      } else {
        const transferResult = spawnCreep.transfer(extensionsToFeed[0], RESOURCE_ENERGY);

        if (transferResult === ERR_NOT_IN_RANGE) {
          const moveResult = spawnCreep.moveTo(extensionsToFeed[0]);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${spawnCreep.name} is not in range of extension ${extensionsToFeed[0].id} in ${extensionsToFeed[0].pos.roomName}, and has moved closer.`
            );
            return moveResult;
          } else {
            Log(
              LogSeverity.ERROR,
              "SpawnCreep",
              `${spawnCreep.name} is not in range of extension ${extensionsToFeed[0].id} in ${extensionsToFeed[0].pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
            return moveResult;
          }
        } else if (transferResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${spawnCreep.name} has deposited energy into extension ${extensionsToFeed[0].id} in ${extensionsToFeed[0].pos.roomName}`
          );
          return transferResult;
        } else {
          Log(
            LogSeverity.ERROR,
            "SpawnCreep",
            `${spawnCreep.name} has failed to deposit energy into extension ${extensionsToFeed[0].id} in ${extensionsToFeed[0].pos.roomName} with result: ${transferResult}`
          );
          return transferResult;
        }
      }
    } else {
      const transferResult = spawnCreep.transfer(spawnsToFeed[0], RESOURCE_ENERGY);
      if (transferResult === ERR_NOT_IN_RANGE) {
        const moveResult = spawnCreep.moveTo(spawnsToFeed[0]);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${spawnCreep.name} is not in range of spawn ${spawnsToFeed[0].id} in ${spawnsToFeed[0].pos.roomName}, and has moved closer.`
          );
          return moveResult;
        } else {
          Log(
            LogSeverity.ERROR,
            "SpawnCreep",
            `${spawnCreep.name} is not in range of spawn ${spawnsToFeed[0].id} in ${spawnsToFeed[0].pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
          );
          return moveResult;
        }
      } else if (transferResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "SpawnCreep",
          `${spawnCreep.name} has deposited energy into spawn ${spawnsToFeed[0].id} in ${spawnsToFeed[0].pos.roomName}`
        );
        return transferResult;
      } else {
        Log(
          LogSeverity.ERROR,
          "SpawnCreep",
          `${spawnCreep.name} has failed to deposit energy into spawn ${spawnsToFeed[0].id} in ${spawnsToFeed[0].pos.roomName} with result: ${transferResult}`
        );
        return transferResult;
      }
    }
  }
}

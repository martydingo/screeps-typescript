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
        }
        if (spawnCreep.memory.curTask === "fetchingEnergy") {
          if (spawnCreep.store[RESOURCE_ENERGY] >= spawnCreep.store.getCapacity(RESOURCE_ENERGY)) {
            spawnCreep.memory.curTask = "feedingSpawns";
          }
        } else {
          if (spawnCreep.store[RESOURCE_ENERGY] === 0) {
            spawnCreep.memory.curTask = "fetchingEnergy";
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
        const transferResult = spawnCreep.transfer(towersToFeed[0], RESOURCE_ENERGY);
        if (transferResult === ERR_NOT_IN_RANGE) {
          const moveResult = spawnCreep.moveTo(towersToFeed[0]);
          return moveResult;
        }
        return transferResult;
      } else {
        const transferResult = spawnCreep.transfer(extensionsToFeed[0], RESOURCE_ENERGY);
        if (transferResult === ERR_NOT_IN_RANGE) {
          const moveResult = spawnCreep.moveTo(extensionsToFeed[0]);
          return moveResult;
        }
        return transferResult;
      }
    } else {
      const transferResult = spawnCreep.transfer(spawnsToFeed[0], RESOURCE_ENERGY);
      if (transferResult === ERR_NOT_IN_RANGE) {
        const moveResult = spawnCreep.moveTo(spawnsToFeed[0]);
        return moveResult;
      }
      return transferResult;
    }
  }
}

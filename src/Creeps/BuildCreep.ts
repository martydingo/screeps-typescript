import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface BuildCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<BuildCreepMemory> {}
}

@profileClass()
export class BuildCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 1, carry: 1, move: 2 };
  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "BuildCreep")
      .forEach(buildCreep => {
        Log(LogSeverity.DEBUG, "BuildCreep", `Operating ${buildCreep.name}`);
        if (buildCreep.memory.curTask === "spawning" && buildCreep.spawning === false) {
          buildCreep.memory.curTask = "fetchingEnergy";
          Log(LogSeverity.DEBUG, "BuildCreep", `${buildCreep.name} has spawned, task set to "fetchingEnergy"`);
        }

        if (buildCreep.memory.curTask === "fetchingEnergy") {
          if (buildCreep.store[RESOURCE_ENERGY] >= buildCreep.store.getCapacity(RESOURCE_ENERGY)) {
            buildCreep.memory.curTask = "constructingSite";
            Log(LogSeverity.DEBUG, "BuildCreep", `${buildCreep.name}'s store is full, task set to "constructingSite"`);
          }
        } else {
          if (buildCreep.store[RESOURCE_ENERGY] === 0) {
            buildCreep.memory.curTask = "fetchingEnergy";
            Log(LogSeverity.DEBUG, "BuildCreep", `${buildCreep.name}'s store is empty, task set to "fetchingEnergy"`);
          }
        }

        switch (buildCreep.memory.curTask) {
          case "fetchingEnergy":
            buildCreep.fetchEnergy();
            break;
          case "constructingSite":
            this.constructSite(buildCreep);
            break;
        }
      });
  }

  private constructSite(buildCreep: Creep) {
    const constructionSiteMatrix = Memory.rooms[buildCreep.memory.assignedRoom!].constructionSites;
    if (constructionSiteMatrix) {
      if (Object.keys(constructionSiteMatrix).length > 0) {
        const constructionSiteDistanceMatrix = Object.entries(constructionSiteMatrix).map(
          ([constructionSiteId, constructionSiteMemory]) => {
            return {
              id: constructionSiteId,
              progress: constructionSiteMemory.progress.total / constructionSiteMemory.progress.progress,
              distance: buildCreep.pos.getRangeTo(constructionSiteMemory.pos.x, constructionSiteMemory.pos.y)
            };
          }
        );

        const closestConstructionSiteId = constructionSiteDistanceMatrix.sort(
          (constructionSiteA, constructionSiteB) => constructionSiteA.distance - constructionSiteB.distance
        )[0].id as Id<ConstructionSite>;
        const closestConstructionSite = Game.getObjectById(closestConstructionSiteId);
        if (closestConstructionSite) {
          const buildResult = buildCreep.build(closestConstructionSite);

          // console.log(`${this.name}`)
          if (buildResult === ERR_NOT_IN_RANGE) {
            Log(
              LogSeverity.DEBUG,
              "BuildCreep",
              `${buildCreep.name} is too far away, moving closer ${closestConstructionSite.id}`
            );
            const moveResult = buildCreep.moveTo(closestConstructionSite);
            if (moveResult !== OK) {
              Log(
                LogSeverity.ERROR,
                "BuildCreep",
                `${buildCreep.name} tried to move closer to ${closestConstructionSite.id}, but failed with error code ${moveResult}!`
              );
            }
            return moveResult;
          } else if (buildResult !== OK) {
            Log(
              LogSeverity.ERROR,
              "BuildCreep",
              `${buildCreep.name} tried to construct ${closestConstructionSite.id}, but failed with error code ${buildResult}!`
            );
          }
        } else {
             Log(
               LogSeverity.WARNING,
               "BuildCreep",
               `${buildCreep.name} cannot find a valid construction site within ${buildCreep.pos.roomName}`
             );
            return ERR_INVALID_TARGET;
        }
      }
      return ERR_NOT_FOUND;
    }
    return ERR_INVALID_TARGET;
  }
}

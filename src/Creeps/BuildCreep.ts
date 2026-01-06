import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface BuildCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<BuildCreepMemory> {}
}


export class BuildCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 1, move: 1 };
  @profileClass("BuildCreep")
  public static run(){


    Object.values(Game.creeps)
      .filter(creep => global.store.creeps[creep.name].type === "BuildCreep")
      .forEach(buildCreep => {
        Log(LogSeverity.DEBUG, "BuildCreep", `Operating ${buildCreep.name}`);
        if (global.store.creeps[buildCreep.name].curTask === "spawning" && buildCreep.spawning === false) {
          global.store.creeps[buildCreep.name].curTask = "fetchingEnergy";
          Log(
            LogSeverity.DEBUG,
            "BuildCreep",
            `${buildCreep.name} has spawned, task set to "fetchingEnergy"`
          );
        }
        if (buildCreep.spawning) return;

        if (global.store.creeps[buildCreep.name].curTask === "fetchingEnergy") {
          if (
            buildCreep.store[RESOURCE_ENERGY] >=
            buildCreep.store.getCapacity(RESOURCE_ENERGY)
          ) {
            global.store.creeps[buildCreep.name].curTask = "constructingSite";
            Log(
              LogSeverity.DEBUG,
              "BuildCreep",
              `${buildCreep.name}'s store is full, task set to "constructingSite"`
            );
          }
        } else {
          if (buildCreep.store[RESOURCE_ENERGY] === 0) {
            global.store.creeps[buildCreep.name].curTask = "fetchingEnergy";
            Log(
              LogSeverity.DEBUG,
              "BuildCreep",
              `${buildCreep.name}'s store is empty, task set to "fetchingEnergy"`
            );
          }
        }

        switch (global.store.creeps[buildCreep.name].curTask) {
          case "fetchingEnergy":
            buildCreep.fetchEnergy();
            break;
          case "constructingSite":
            BuildCreep.constructSite(buildCreep);
            break;
        }
      });
  }

 @profileMethod
  private static constructSite(buildCreep: Creep) {
    const constructionSiteMatrix =
      global.store.rooms[global.store.creeps[buildCreep.name].assignedRoom!].constructionSites;
    if (constructionSiteMatrix) {
      if (Object.keys(constructionSiteMatrix).length > 0) {
        const constructionSiteDistanceMatrix = Object.entries(
          constructionSiteMatrix
        ).map(([constructionSiteId, constructionSiteMemory]) => {
          return {
            id: constructionSiteId,
            progress:
              constructionSiteMemory.progress.total /
              constructionSiteMemory.progress.progress,
            distance: buildCreep.pos.getRangeTo(
              constructionSiteMemory.pos.x,
              constructionSiteMemory.pos.y
            )
          };
        });

        const closestConstructionSiteId = constructionSiteDistanceMatrix.sort(
          (constructionSiteA, constructionSiteB) =>
            constructionSiteA.distance - constructionSiteB.distance
        )[0].id as Id<ConstructionSite>;
        const closestConstructionSite = Game.getObjectById(closestConstructionSiteId);
        if (closestConstructionSite) {
          const closestConstructionSiteDistance = buildCreep.pos.getRangeTo(
            closestConstructionSite
          );
          if (closestConstructionSiteDistance >= 2) {
            const moveResult = buildCreep.moveTo(closestConstructionSite);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${buildCreep.name} is not in range of construction site ${closestConstructionSite.id} in ${closestConstructionSite.pos.roomName}, and has moved closer.`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${buildCreep.name} is not in range of construction site ${closestConstructionSite.id} in ${closestConstructionSite.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            if (buildCreep.pos.getRangeTo(closestConstructionSite) > 1)
              return moveResult;
          }
          const buildResult = buildCreep.build(closestConstructionSite);

          // console.log(`${this.name}`)
          if (buildResult !== OK) {
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

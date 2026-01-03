import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface ControllerCreepMemory extends CreepMemoryTemplate {
  assignedController: Id<StructureController>;
  assignedBoostLab?: Id<StructureLab>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ControllerCreepMemory> {
  }
}

@profileClass()
export class ControllerCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 1, move: 3 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "ControllerCreep")
      .forEach(ctrlCreep => {
        if (ctrlCreep.memory.curTask === "spawning" && ctrlCreep.spawning === false) {
          ctrlCreep.memory.curTask = "fetchingEnergy";
          Log(
            LogSeverity.DEBUG,
            "ControllerCreep",
            `${ctrlCreep.name} has spawned, task set to "fetchingEnergy"`
          );
        }
        if (ctrlCreep.spawning) return;
        if (ctrlCreep.fatigue > 0) return;

        const desiredBoost = {
          mineral: RESOURCE_CATALYZED_GHODIUM_ACID,
          bodyPart: WORK
        };
        const boostCheck = this.manageBoosts(ctrlCreep, desiredBoost);
        // if (ctrlCreep.pos.roomName === "E12S16") {
        // console.log("---");
        // console.log(ctrlCreep.pos.roomName);
        // console.log(boostCheck);
        // console.log("---");
        // }
        if (boostCheck === true) {
          if (ctrlCreep.memory.curTask === "fetchingEnergy") {
            // if()
            if (ctrlCreep.store[RESOURCE_ENERGY] > 0) {
              ctrlCreep.memory.curTask = "upgradingController";
              Log(
                LogSeverity.DEBUG,
                "ControllerCreep",
                `${ctrlCreep.name}'s store is full, task set to "upgradingController"`
              );
            }
          } else {
            if (ctrlCreep.store[RESOURCE_ENERGY] === 0) {
              ctrlCreep.memory.curTask = "fetchingEnergy";
              Log(
                LogSeverity.DEBUG,
                "ControllerCreep",
                `${ctrlCreep.name}'s store is empty, task set to "fetchingEnergy"`
              );
            }
          }

          switch (ctrlCreep.memory.curTask) {
            case "fetchingEnergy":
              this.fetchEnergy(ctrlCreep);
              break;
            case "upgradingController":
              this.upgradeController(ctrlCreep);
              break;
          }
        }
      });
  }
  @profileMethod
  private fetchEnergy(ctrlCreep: Creep) {
    let controllerLinkId = null;
    const roomMemory = Memory.rooms[ctrlCreep.memory.room!];
    if (roomMemory) {
      const structuresMemory = roomMemory.structures;
      if (structuresMemory) {
        const linksMemory = structuresMemory.links;
        if (linksMemory) {
          controllerLinkId = Object.entries(linksMemory)
            .filter(([, linkMemory]) => linkMemory.linkType === "controller")
            .map(([linkId]) => linkId)
            .pop();
        }
      }
    }
    if (controllerLinkId !== null) {
      const controllerLink = Game.getObjectById(controllerLinkId as Id<StructureLink>);
      if (controllerLink) {
        if (
          controllerLink.store[RESOURCE_ENERGY] >=
          ctrlCreep.store.getCapacity() / 2
        ) {
          Log(
            LogSeverity.DEBUG,
            "ControllerCreep",
            `A controller link (${controllerLink.id} has been detected, and ${ctrlCreep.name} will use this for energy`
          );
          const linkDistance = ctrlCreep.pos.getRangeTo(controllerLink);
          if (linkDistance > 2) {
            const moveResult = ctrlCreep.moveTo(controllerLink);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "ControllerCreep",
                `${ctrlCreep.name} is not in range of ${controllerLink.id} in ${controllerLink.pos.roomName}, and is moving closer`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "ControllerCreep",
                `${ctrlCreep.name} is not in range of link ${controllerLink.id} in ${controllerLink.pos.roomName}, and has failed to move closer with a result of ${moveResult}`
              );
            }
            return moveResult;
          } else {
            if (linkDistance === 2) {
              const moveResult = ctrlCreep.moveTo(controllerLink);
              if (moveResult === OK) {
                Log(
                  LogSeverity.DEBUG,
                  "ControllerCreep",
                  `${ctrlCreep.name} is not in range of ${controllerLink.id} in ${controllerLink.pos.roomName}, and is moving closer`
                );
              } else {
                Log(
                  LogSeverity.ERROR,
                  "ControllerCreep",
                  `${ctrlCreep.name} is not in range of link ${controllerLink.id} in ${controllerLink.pos.roomName}, and has failed to move closer with a result of ${moveResult}`
                );
                return moveResult;
              }
            }

            const withdrawResult = ctrlCreep.withdraw(controllerLink, RESOURCE_ENERGY);
            if (withdrawResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "ControllerCreep",
                `${ctrlCreep.name} has withdrawn energy from ${controllerLink.id} in ${controllerLink.pos.roomName}`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "ControllerCreep",
                `${ctrlCreep.name} has failed to withdraw energy from ${controllerLink.id} in ${controllerLink.pos.roomName} with the result: ${withdrawResult}`
              );
            }
            return withdrawResult;
          }
        } else {
          return ctrlCreep.fetchEnergy();
        }
      } else {
        return ctrlCreep.fetchEnergy();
      }
    } else {
      return ctrlCreep.fetchEnergy();
    }
  }

  @profileMethod
  private manageBoosts(
    ctrlCreep: Creep,
    desiredBoost: { mineral: MineralBoostConstant; bodyPart: BodyPartConstant }
  ) {
    const desiredBoostParts = ctrlCreep.body
      .filter(part => part.type === desiredBoost.bodyPart)
      .map(part => part.type);
    const boostedParts = ctrlCreep.body
      .filter(
        part =>
          part.type === desiredBoost.bodyPart && part.boost === desiredBoost.mineral
      )
      .map(part => part.type);

    // console.log(ctrlCreep);
    // console.log(boostedParts.length);
    // console.log(desiredBoostParts.length);
    const boostLabs: StructureLab[] = [];
    if (boostedParts.length < desiredBoostParts.length) {
      const requiredMineralAmount =
        (desiredBoostParts.length - boostedParts.length) * 30;
      const requiredEnergyAmount =
        (desiredBoostParts.length - boostedParts.length) * 20;
      Object.keys(Game.rooms).forEach(roomName => {
        const structureMonitorMemory = Memory.rooms[roomName].structures;
        if (structureMonitorMemory) {
          const labsMonitorMemory = structureMonitorMemory.labs;
          if (labsMonitorMemory) {
            const labsWithResources = Object.entries(labsMonitorMemory).filter(
              ([, labMonitorMemory]) => labMonitorMemory.resources[desiredBoost.mineral]
            );

            const labsWithEnoughResources = labsWithResources
              .filter(
                ([, lab]) =>
                  lab.resources[desiredBoost.mineral].amount >= requiredMineralAmount &&
                  lab.resources[RESOURCE_ENERGY].amount >= requiredEnergyAmount
              )
              .map(([labId]) => labId as Id<StructureLab>);
            if (labsWithEnoughResources.length > 0) {
              const boostLabDistanceMatrix: { lab: StructureLab; distance: number }[] =
                [];
              labsWithEnoughResources.map(labId => {
                const lab = Game.getObjectById(labId);
                if (lab) {
                  boostLabDistanceMatrix.push({
                    lab,
                    distance: Game.map.getRoomLinearDistance(
                      lab.pos.roomName,
                      ctrlCreep.pos.roomName
                    )
                  });
                }
              });
              const sortedBoostLabDistanceMatrix = boostLabDistanceMatrix.sort(
                (boostLabA, boostLabB) => boostLabA.distance - boostLabB?.distance
              );

              const closestBoostLab = sortedBoostLabDistanceMatrix[0];
              if (closestBoostLab.distance <= 1) {
                boostLabs.push(closestBoostLab.lab);
              }
            }
          }
        }
      });
    } else return true;
    if (boostLabs.length > 0) {
      const creepsAlreadyBoosting = Object.values(Game.creeps).filter(((creep) => creep.memory.assignedBoostLab === boostLabs[0].id))
      if (creepsAlreadyBoosting.length === 0) {
        ctrlCreep.memory.assignedBoostLab = boostLabs[0].id
        const boostResult = this.boostParts(ctrlCreep, boostLabs[0]);
        return false;
      } else {
        return true
      }
    } else {
      return true;
    }
  }

  @profileMethod
  private boostParts(ctrlCreep: Creep, boostLab: StructureLab) {
    const boostLabDistance = ctrlCreep.pos.getRangeTo(boostLab);
    if (boostLabDistance >= 2) {
      const moveResult = ctrlCreep.moveTo(boostLab);
      if (moveResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${ctrlCreep.name} is not in range of controller ${boostLab.id} in ${boostLab.pos.roomName}, and has moved closer.`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${ctrlCreep.name} is not in range of controller ${boostLab.id} in ${boostLab.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
        );
      }
      if (ctrlCreep.pos.getRangeTo(boostLab) > 1) return moveResult;
    }
    const boostResult = boostLab.boostCreep(ctrlCreep);
    if (boostResult === OK) {
      delete ctrlCreep.memory.assignedBoostLab
    }
    return boostResult;
  }

  @profileMethod
  private upgradeController(ctrlCreep: Creep) {
    const assignedController = Game.getObjectById(ctrlCreep.memory.assignedController!);
    if (assignedController) {
      const assignedControllerDistance = ctrlCreep.pos.getRangeTo(assignedController);
      if (assignedControllerDistance >= 4) {
        const moveResult = ctrlCreep.moveTo(assignedController);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${ctrlCreep.name} is not in range of controller ${assignedController.id} in ${assignedController.pos.roomName}, and has moved closer.`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${ctrlCreep.name} is not in range of controller ${assignedController.id} in ${assignedController.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
          );
        }
        if (ctrlCreep.pos.getRangeTo(assignedController) > 3) return moveResult;
      }
      const upgradeResult = ctrlCreep.upgradeController(assignedController);
      if (upgradeResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "ControllerCreep",
          `${ctrlCreep.name} has upgraded controller ${assignedController.id} in ${assignedController.pos.roomName}`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "ControllerCreep",
          `${ctrlCreep.name} has failed to upgrade the controller ${assignedController.id} in ${assignedController.pos.roomName} with the result: ${upgradeResult}`
        );
      }
      return upgradeResult;
    }
    return ERR_INVALID_TARGET;
  }
}

import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface ControllerCreepMemory extends CreepMemoryTemplate {
  assignedController: Id<StructureController>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ControllerCreepMemory> {}
}

export class ControllerCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 1, move: 1.5 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "ControllerCreep")
      .forEach(ctrlCreep => {
        if (ctrlCreep.memory.curTask === "spawning" && ctrlCreep.spawning === false) {
          ctrlCreep.memory.curTask = "fetchingEnergy";
          Log(LogSeverity.DEBUG, "ControllerCreep", `${ctrlCreep.name} has spawned, task set to "fetchingEnergy"`);
        }

        if (ctrlCreep.memory.curTask === "fetchingEnergy") {
          if (ctrlCreep.store[RESOURCE_ENERGY] >= ctrlCreep.store.getCapacity(RESOURCE_ENERGY)) {
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
            ctrlCreep.fetchEnergy();
            break;
          case "upgradingController":
            this.upgradeController(ctrlCreep);
            break;
        }
      });
  }

  private upgradeController(ctrlCreep: Creep) {
    const assignedController = Game.getObjectById(ctrlCreep.memory.assignedController!);
    if (assignedController) {
      const upgradeResult = ctrlCreep.upgradeController(assignedController);

      if (upgradeResult === ERR_NOT_IN_RANGE) {
        const moveResult = ctrlCreep.moveTo(assignedController);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "ControllerCreep",
            `${ctrlCreep.name} is not in range of ${assignedController.id} in ${assignedController.pos.roomName}, and is moving closer`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "ControllerCreep",
            `${ctrlCreep.name} is not in range of ${assignedController.id} in ${assignedController.pos.roomName}, and has failed to move closer with a result of ${moveResult}`
          );
        }

      } else if (upgradeResult === OK) {
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

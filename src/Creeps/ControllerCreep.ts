import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface ControllerCreepMemory extends CreepMemoryTemplate {
  assignedController: Id<StructureController>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ControllerCreepMemory> {}
}

export class ControllerCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 1, carry: 1, move: 1.5 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "ControllerCreep")
      .forEach(ctrlCreep => {
        if (ctrlCreep.memory.curTask === "spawning" && ctrlCreep.spawning === false) {
          ctrlCreep.memory.curTask = "fetchingEnergy";
        }

        if (ctrlCreep.memory.curTask === "fetchingEnergy") {
          if (ctrlCreep.store[RESOURCE_ENERGY] >= ctrlCreep.store.getCapacity(RESOURCE_ENERGY)) {
            ctrlCreep.memory.curTask = "upgradingController";
          }
        } else {
          if (ctrlCreep.store[RESOURCE_ENERGY] === 0) {
            ctrlCreep.memory.curTask = "fetchingEnergy";
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
        ctrlCreep.moveTo(assignedController);
      }
      return upgradeResult;
    }
    return ERR_INVALID_TARGET;
  }
}

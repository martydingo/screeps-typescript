import { Log, LogSeverity } from "utils/log";

export interface CreepMemoryTemplate {
  type: string;
  room: string;
  curTask: string;
}

declare global {
  interface Creep {
    mineSource: (sourceId: Id<Source>) => number;
    fetchDroppedEnergy: () => number;
    fetchDroppedResource: () => number;
    lootEnergyFromRuin: () => number;
    fetchEnergyFromStorage: () => number;
    fetchEnergy: () => number;
  }
}

Creep.prototype.mineSource = function (sourceId: Id<Source>) {
  const source = Game.getObjectById(sourceId);

  if (source) {
    const harvestResult = this.harvest(source);
    if (harvestResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveTo(source);
      if (moveResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${this.name} is not in range of source ${source.id} in ${source.pos.roomName}, and has moved closer.`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${this.name} is not in range of source ${source.id} in ${source.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
        );
      }
      return moveResult;
    } else if (harvestResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} has harvested energy from source ${source.id} in ${source.pos.roomName}`
      );
    } else {
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} has failed to harvest energy from source ${source.id} in ${source.pos.roomName} with result: ${harvestResult}`
      );
    }

    return harvestResult;
  }
  return ERR_INVALID_TARGET;
};

Creep.prototype.fetchDroppedEnergy = function () {
  const resourceMatrix = Memory.rooms[this.room.name].resources;
  if (resourceMatrix) {
    const resourceDistanceMatrix = Object.entries(resourceMatrix)
      .filter(([, resourceMemory]) => resourceMemory.resource === RESOURCE_ENERGY && resourceMemory.amount > 50)
      .map(([resourceId, resourceMemory]) => {
        return {
          id: resourceId,
          amount: resourceMemory.amount,
          distance: this.pos.getRangeTo(resourceMemory.pos.x, resourceMemory.pos.y)
        };
      });

    const closestResourceMatrix = resourceDistanceMatrix.sort(
      (resourceA, resourceB) => resourceA.distance - resourceB.distance
    )[0];
    if (closestResourceMatrix) {
      const closestResourceId = closestResourceMatrix.id as Id<Resource>;
      const closestResource = Game.getObjectById(closestResourceId);
      if (closestResource) {
        const pickupResult = this.pickup(closestResource);

        // console.log(`${this.name}`)
        if (pickupResult === ERR_NOT_IN_RANGE) {
          const moveResult = this.moveTo(closestResource);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestResource.id} in ${closestResource.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestResource.id} in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
        } else if (pickupResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${this.name} has picked up energy from resource ${closestResource.id} in ${closestResource.pos.roomName}`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${this.name} has failed to pick up energy from resource ${closestResource.id} in ${closestResource.pos.roomName} with result: ${pickupResult}`
          );
        }
        return pickupResult;
      } else return ERR_INVALID_TARGET;
    } else return ERR_NOT_FOUND;
  } else return ERR_NOT_FOUND;
};

Creep.prototype.fetchDroppedResource = function () {
  const resourceMatrix = Memory.rooms[this.room.name].resources;
  if (resourceMatrix) {
    const resourceDistanceMatrix = Object.entries(resourceMatrix).map(([resourceId, resourceMemory]) => {
      return {
        id: resourceId,
        amount: resourceMemory.amount,
        distance: this.pos.getRangeTo(resourceMemory.pos.x, resourceMemory.pos.y)
      };
    });

    const closestResourceMatrix = resourceDistanceMatrix
      .sort((resourceA, resourceB) => resourceA.distance - resourceB.distance)
      .filter(resource => resource.amount >= this.store.getFreeCapacity())[0];
    if (closestResourceMatrix) {
      const closestResourceId = closestResourceMatrix.id as Id<Resource>;
      const closestResource = Game.getObjectById(closestResourceId);
      if (closestResource) {
        const pickupResult = this.pickup(closestResource);

        // console.log(`${this.name}`)
        if (pickupResult === ERR_NOT_IN_RANGE) {
          const moveResult = this.moveTo(closestResource);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} is not in range of resource ${closestResource.id} of type ${closestResource.resourceType} in ${closestResource.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} is not in range of resource ${closestResource.id} of type ${closestResource.resourceType} in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
        } else if (pickupResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${this.name} has picked up ${closestResource.resourceType} from resource ${closestResource.id} in ${closestResource.pos.roomName}`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${this.name} has failed to pick up ${closestResource.resourceType} from resource ${closestResource.id} in ${closestResource.pos.roomName} with result: ${pickupResult}`
          );
        }
        return pickupResult;
      } else return ERR_INVALID_TARGET;
    } else return ERR_NOT_FOUND;
  } else return ERR_NOT_FOUND;
};

Creep.prototype.lootEnergyFromRuin = function () {
  const ruinMatrix = Memory.rooms[this.room.name].structures?.ruins;
  if (ruinMatrix) {
    const ruinDistanceMatrix = Object.entries(ruinMatrix)
      .filter(([, ruinMemory]) => ruinMemory.energy.amount > 0)
      .map(([ruinId, ruinMemory]) => {
        return {
          id: ruinId,
          amount: ruinMemory.energy.amount,
          distance: this.pos.getRangeTo(ruinMemory.pos.x, ruinMemory.pos.y)
        };
      });

    const closestRuinMatrix = ruinDistanceMatrix.sort((ruinA, ruinB) => ruinA.distance - ruinB.distance)[0];
    if (closestRuinMatrix) {
      const closestRuinId = closestRuinMatrix.id as Id<Ruin>;
      const closestRuin = Game.getObjectById(closestRuinId);
      if (closestRuin) {
        const withdrawResult = this.withdraw(closestRuin, RESOURCE_ENERGY);

        // console.log(`${this.name}`)
        if (withdrawResult === ERR_NOT_IN_RANGE) {
          const moveResult = this.moveTo(closestRuin);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestRuin.id} in ${closestRuin.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestRuin.id} in ${closestRuin.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
        } else if (withdrawResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${this.name} has picked up energy from resource ${closestRuin.id} in ${closestRuin.pos.roomName}`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${this.name} has failed to pick up energy from resource ${closestRuin.id} in ${closestRuin.pos.roomName} with result: ${withdrawResult}`
          );
        }
        return withdrawResult;
      } else return ERR_INVALID_TARGET;
    } else return ERR_NOT_FOUND;
  } else return ERR_NOT_FOUND;
};

Creep.prototype.fetchEnergyFromStorage = function () {
  if (this.room.storage) {
    if (this.room.storage.store[RESOURCE_ENERGY] > 500) {
      const withdrawResult = this.withdraw(this.room.storage, RESOURCE_ENERGY);
      if (withdrawResult === ERR_NOT_IN_RANGE) {
        const moveResult = this.moveTo(this.room.storage);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${this.name} is not in range of storage ${this.room.storage.id} in ${this.room.storage.pos.roomName}, and has moved closer.`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${this.name} is not in range of storage ${this.room.storage.id} in ${this.room.storage.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
          );
        }
        return OK;
      } else if (withdrawResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${this.name} has withdrawn energy from storage ${this.room.storage.id} in ${this.room.storage.pos.roomName}`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${this.name} has failed to withdraw energy from storage ${this.room.storage.id} in ${this.room.storage.pos.roomName} with result: ${withdrawResult}`
        );
      }
      return withdrawResult;
    } else {
      return ERR_INVALID_TARGET;
    }
  }
  return ERR_NOT_FOUND;
};

Creep.prototype.fetchEnergy = function () {
  const withdrawResult = this.fetchEnergyFromStorage();
  if (withdrawResult !== OK) {
    Log(
      LogSeverity.DEBUG,
      "CreepTemplate",
      `${this.name} has failed to withdraw energy from storage, attempting to fetch dropped energy...`
    );
    const fetchDroppedResourceResult = this.fetchDroppedEnergy();
    if (fetchDroppedResourceResult !== OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} has failed to withdraw energy from both storage and dropped energu, attempting to fetch energy from ruins`
      );
      this.lootEnergyFromRuin();
    }
    return fetchDroppedResourceResult;
  }
  return ERR_INVALID_TARGET;
};

export class CreepTemplate {
  // private bodyParts: BodyPartConstant[]
  public constructor() {
    //
  }
}

export interface CreepMemoryTemplate {
  type: string;
  room: string;
  curTask: string;
}

declare global {
  interface Creep {
    mineSource: (sourceId: Id<Source>) => number;
    fetchDroppedEnergy: () => number;
    lootEnergyFromRuin: () => number;
    fetchEnergy: () => number;
  }
}

Creep.prototype.mineSource = function (sourceId: Id<Source>) {
  const source = Game.getObjectById(sourceId);

  if (source) {
    const harvestResult = this.harvest(source);
    if (harvestResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveTo(source);
      return moveResult;
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
          this.moveTo(closestResource);
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
          this.moveTo(closestRuin);
        }
        return withdrawResult;
      } else return ERR_INVALID_TARGET;
    } else return ERR_NOT_FOUND;
  } else return ERR_NOT_FOUND;
};

Creep.prototype.fetchEnergy = function () {
  const fetchDroppedResourceResult = this.fetchDroppedEnergy();
  if (fetchDroppedResourceResult !== OK) {
    this.lootEnergyFromRuin();
  }

  return fetchDroppedResourceResult;
};

export class CreepTemplate {
  // private bodyParts: BodyPartConstant[]
  public constructor() {
    //
  }
}

export interface CreepMemoryTemplate {
  type: string;
  room: string;
  curTask: string;
}

declare global {
  interface Creep {
    mineSource: (sourceId: Id<Source>) => number;
    fetchDroppedEnergy: () => number;
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
      .filter(([, resourceMemory]) => resourceMemory.resource === RESOURCE_ENERGY)
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

Creep.prototype.fetchEnergy = function () {
  const fetchDroppedResourceResult = this.fetchDroppedEnergy();

  return fetchDroppedResourceResult;
};

export class CreepTemplate {
  // private bodyParts: BodyPartConstant[]
  public constructor() {
    //
  }
}

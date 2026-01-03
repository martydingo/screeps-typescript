/* eslint-disable no-underscore-dangle */
import { config } from "config";
import { parameterProfiler, profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { Pathfinding } from "utils/Pathfinding";

export interface CreepMemoryTemplate {
  type: string;
  room: string;
  curTask: string;
  _pathfind?: {
    worldRoute: {
      exit: ExitConstant;
      room: string;
    }[];
    roomRoute: { roomName: string; path: string };
  };
}

interface GenericStructureWithStore extends Structure<StructureConstant> {
  store: StoreDefinition;
}

declare global {
  interface Creep {
    _moveTo(
      x: number,
      y: number,
      opts?: MoveToOpts
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;
    _moveTo(
      target: RoomPosition | { pos: RoomPosition },
      opts?: MoveToOpts
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;

    mineSource: (sourceId: Id<Source>) => number;
    fetchDroppedEnergy: () => number;
    fetchDroppedResource: () => number;
    lootEnergyFromRuin: () => number;
    lootResourceFromTombstone: (resourceType: ResourceConstant) => number;
    depositResourceIntoStructure: (
      structure: GenericStructureWithStore,
      resourceType: ResourceConstant,
      amount?: number
    ) => number;
    fetchResourceFromStructure: (
      structure: GenericStructureWithStore,
      resourceType: ResourceConstant,
      amount?: number
    ) => number;
    fetchResourceFromStorage: (
      resourceType: ResourceConstant,
      amount?: number
    ) => number;
    fetchResourceFromTerminal: (
      resourceType: ResourceConstant,
      amount?: number
    ) => number;
    fetchEnergy: () => number;
    moveToUnknownRoom: (destinationRoomName: string, opts?: MoveToOpts) => number;
  }

  interface Memory {
    heatMaps: {
      creep: {
        [key: string]: { [key: number]: { [key: number]: { [key: number]: number } } };
      };
    };
  }
}

Creep.prototype.mineSource = function (sourceId: Id<Source>) {
  const source = Game.getObjectById(sourceId);

  if (source) {
    if (source.energy !== 0) {
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
  }
  return ERR_INVALID_TARGET;
};

Creep.prototype.fetchDroppedEnergy = function () {
  const resourceMatrix = Memory.rooms[this.room.name].resources;
  if (resourceMatrix) {
    const resourceDistanceMatrix = Object.entries(resourceMatrix)
      .filter(
        ([, resourceMemory]) =>
          resourceMemory.resource === RESOURCE_ENERGY && resourceMemory.amount > 50
      )
      .map(([resourceId, resourceMemory]) => {
        return {
          id: resourceId,
          amount: resourceMemory.amount,
          distance: this.pos.getRangeTo(resourceMemory.pos.x, resourceMemory.pos.y)
        };
      });

    const closestResourceMatrix = resourceDistanceMatrix
      .filter((resource)=>resource.amount > this.store.getCapacity())
    .sort(
      (resourceA, resourceB) => resourceA.distance - resourceB.distance
    )[0];
    if (closestResourceMatrix) {
      const closestResourceId = closestResourceMatrix.id as Id<Resource>;
      const closestResource = Game.getObjectById(closestResourceId);
    // const largestResourceMatrix = resourceDistanceMatrix.sort(
    //   (resourceA, resourceB) => resourceB.amount - resourceA.amount
    // )[0];
    // if (largestResourceMatrix) {
    //   const largestResourceId = largestResourceMatrix.id as Id<Resource>;
    //   const largestResource = Game.getObjectById(largestResourceId);
    //   if (largestResource) {
      if (closestResource) {
        // const pickupResult = this.pickup(largestResource);
        const pickupResult = this.pickup(closestResource);

        if (pickupResult === ERR_NOT_IN_RANGE) {
          // const moveResult = this.moveTo(largestResource);
          const moveResult = this.moveTo(closestResource);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              // `${this.name} is not in range of energy resource ${largestResource.id} in ${largestResource.pos.roomName}, and has moved closer.`
              `${this.name} is not in range of energy resource ${closestResource.id} in ${closestResource.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              // `${this.name} is not in range of energy resource ${largestResource.id} in ${largestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              `${this.name} is not in range of energy resource ${closestResource.id} in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
        } else if (pickupResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            // `${this.name} has picked up energy from resource ${largestResource.id} in ${largestResource.pos.roomName}`
            `${this.name} has picked up energy from resource ${closestResource.id} in ${closestResource.pos.roomName}`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            // `${this.name} has failed to pick up energy from resource ${largestResource.id} in ${largestResource.pos.roomName} with result: ${pickupResult}`
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
    const resourceDistanceMatrix = Object.entries(resourceMatrix).map(
      ([resourceId, resourceMemory]) => {
        return {
          id: resourceId,
          amount: resourceMemory.amount,
          distance: this.pos.getRangeTo(resourceMemory.pos.x, resourceMemory.pos.y)
        };
      }
    );

    const closestResourceMatrix = resourceDistanceMatrix.sort(
      (resourceA, resourceB) => resourceB.amount - resourceA.amount
    )[0];
    // .filter(resource => resource.amount >= this.store.getFreeCapacity())[0];
    if (closestResourceMatrix) {
      const closestResourceId = closestResourceMatrix.id as Id<Resource>;
      const closestResource = Game.getObjectById(closestResourceId);
      if (closestResource) {
        const pickupResult = this.pickup(closestResource);

        if (pickupResult === ERR_NOT_IN_RANGE) {
          const moveResult = this.moveTo(closestResource);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} is not in range of resource ${closestResource.id} of type ${closestResource.resourceType} in ${closestResource.pos.roomName}, and has moved closer.`
            );
            return moveResult;
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} is not in range of resource ${closestResource.id} of type ${closestResource.resourceType} in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
            return moveResult;
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

Creep.prototype.lootResourceFromTombstone = function (resourceType: ResourceConstant) {
  const tombstones = Memory.rooms[this.room.name].tombstones;
  if (tombstones) {
    if (Object.keys(tombstones).length > 0) {
      const tombstonesWithEnergy = Object.entries(tombstones)
        .filter(([, tombstoneMemory]) => tombstoneMemory.resources[resourceType] > 0)
        .map(([tombstoneId, tombstoneMemory]) => {
          return { id: tombstoneId, pos: tombstoneMemory.pos };
        });
      if (tombstonesWithEnergy.length > 0) {
        const tombstoneDistanceMatrix = tombstonesWithEnergy
          .map(tombstone => {
            return { id: tombstone.id, distance: this.pos.getRangeTo(tombstone.pos) };
          })
          .sort((tombstoneA, tombstoneB) => tombstoneA.distance - tombstoneB.distance);
        const tombstoneToLoot = Game.getObjectById(
          tombstoneDistanceMatrix[0].id as Id<Tombstone>
        );
        if (tombstoneToLoot) {
          const withdrawResult = this.withdraw(tombstoneToLoot, resourceType);
          if (withdrawResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveTo(tombstoneToLoot);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${this.name} is not in range of tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName}, and has moved closer.`
              );
              return moveResult;
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${this.name} is not in range of tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            return moveResult;
          } else if (withdrawResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} has picked up ${resourceType} from tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName}`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} has failed to pick up ${resourceType} from tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName} with result: ${withdrawResult}`
            );
          }
          return withdrawResult;
        }
      }
    }
    return ERR_NOT_FOUND;
  }
  return ERR_NOT_FOUND;
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

    const closestRuinMatrix = ruinDistanceMatrix.sort(
      (ruinA, ruinB) => ruinA.distance - ruinB.distance
    )[0];
    if (closestRuinMatrix) {
      const closestRuinId = closestRuinMatrix.id as Id<Ruin>;
      const closestRuin = Game.getObjectById(closestRuinId);
      if (closestRuin) {
        const withdrawResult = this.withdraw(closestRuin, RESOURCE_ENERGY);
        if (withdrawResult === ERR_NOT_IN_RANGE) {
          const moveResult = this.moveTo(closestRuin);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestRuin.id} in ${closestRuin.pos.roomName}, and has moved closer.`
            );
            return moveResult;
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} is not in range of energy resource ${closestRuin.id} in ${closestRuin.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
            return moveResult;
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

Creep.prototype.fetchResourceFromStructure = function (
  structure: GenericStructureWithStore,
  resourceType: ResourceConstant,
  amount?: number
) {
  if (
    resourceType !== RESOURCE_ENERGY ||
    structure.structureType !== STRUCTURE_STORAGE ||
    structure.store[resourceType] > 2000 ||
    (this.memory.type === "SpawnCreep" &&
      structure.store[resourceType] > this.store.getCapacity())
  ) {
    let cappedAmount = Math.min(
      this.store.getFreeCapacity(resourceType),
      structure.store[resourceType]
    );
    if (amount) {
      cappedAmount = Math.min(
        amount,
        this.store.getFreeCapacity(resourceType),
        structure.store[resourceType]
      );
    }
    const withdrawResult = this.withdraw(structure, resourceType, cappedAmount);

    if (withdrawResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveTo(structure);
      if (moveResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${this.name} is not in range of storage ${structure.id} in ${structure.pos.roomName}, and has moved closer.`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${this.name} is not in range of storage ${structure.id} in ${structure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
        );
      }
      return OK;
    } else if (withdrawResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} has withdrawn ${resourceType} from storage ${structure.id} in ${structure.pos.roomName}`
      );
    } else {
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} has failed to withdraw ${resourceType} from storage ${structure.id} in ${structure.pos.roomName} with result: ${withdrawResult}`
      );
    }
    return withdrawResult;
  } else {
    return ERR_INVALID_TARGET;
  }
};

Creep.prototype.depositResourceIntoStructure = function (
  structure: GenericStructureWithStore,
  resourceType: ResourceConstant,
  amount?: number
) {
  let cappedAmount = this.store[resourceType];
  if (amount) {
    cappedAmount = Math.min(amount, this.store[resourceType]);
  }
  let transferResult = this.transfer(structure, resourceType, cappedAmount);

  if (transferResult === ERR_FULL) {
    transferResult = this.transfer(structure, resourceType);
  }
  if (transferResult === ERR_NOT_IN_RANGE) {
    const moveResult = this.moveTo(structure);
    if (moveResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} is not in range of storage ${structure.id} in ${structure.pos.roomName}, and has moved closer.`
      );
    } else {
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} is not in range of storage ${structure.id} in ${structure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
      );
    }
    return OK;
  } else if (transferResult === OK) {
    Log(
      LogSeverity.DEBUG,
      "CreepTemplate",
      `${this.name} has transfern ${resourceType} into storage ${structure.id} in ${structure.pos.roomName}`
    );
  } else {
    Log(
      LogSeverity.ERROR,
      "CreepTemplate",
      `${this.name} has failed to transfer ${resourceType} into storage ${structure.id} in ${structure.pos.roomName} with result: ${transferResult}`
    );
  }
  return transferResult;
};

Creep.prototype.fetchResourceFromStorage = function (
  resourceType: ResourceConstant,
  amount?: number
) {
  if (this.room.storage) {
    return this.fetchResourceFromStructure(this.room.storage, resourceType, amount);
  } else {
    return ERR_INVALID_TARGET;
  }
};

Creep.prototype.fetchResourceFromTerminal = function (
  resourceType: ResourceConstant,
  amount?: number
) {
  if (this.room.terminal) {
    return this.fetchResourceFromStructure(this.room.terminal, resourceType, amount);
  } else {
    return ERR_NOT_FOUND;
  }
};

Creep.prototype.fetchEnergy = function () {
  const withdrawResult = this.fetchResourceFromStorage(RESOURCE_ENERGY);
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
        `${this.name} has failed to withdraw energy from both storage and dropped energy, attempting to fetch energy from ruins`
      );
      this.lootEnergyFromRuin();
    }
    return fetchDroppedResourceResult;
  }
  return ERR_INVALID_TARGET;
};

Creep.prototype.moveToUnknownRoom = function (
  destinationRoomName: string,
  opts?: MoveToOpts
) {
  if (!this.memory._pathfind) {
    Log(
      LogSeverity.DEBUG,
      "CreepTemplate",
      `${this.name} has requested pathfinding but no _pathfind memory found, _pathfind memory has been initalised`
    );
    this.memory._pathfind = {
      worldRoute: [],
      roomRoute: {
        roomName: this.pos.roomName,
        path: ""
      }
    };
  }
  if (destinationRoomName !== this.pos.roomName) {
    if (this.memory._pathfind.worldRoute.length === 0) {
      const workingWorldRoute = Pathfinding.routeToRoom(
        this.pos.roomName,
        destinationRoomName
      );
      if (workingWorldRoute !== ERR_NO_PATH) {
        this.memory._pathfind.worldRoute = workingWorldRoute;
      } else {
        return ERR_NO_PATH;
      }
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `Created world route for ${this.name} from ${this.pos.roomName} to ${destinationRoomName}, and stored in creep memory.`
      );
    }
    if (this.memory._pathfind.roomRoute.roomName !== this.pos.roomName) {
      this.memory._pathfind.roomRoute.roomName = this.pos.roomName;
      this.memory._pathfind.roomRoute.path = "";
      Log(
        LogSeverity.INFORMATIONAL,
        "CreepTemplate",
        `Room has changed for the room route for ${this.name} in ${this.pos.roomName} towards ${destinationRoomName}, room route memory reset.`
      );
    }
    if (this.memory._pathfind.roomRoute.path === "") {
      const worldRoute = this.memory._pathfind.worldRoute;

      let curRoomExit;

      // const curRoomExits = worldRoute.filter(roomPath => roomPath.room === this.memory._pathfind?.roomRoute.roomName);
      worldRoute.forEach((roomPath, index) => {
        if (roomPath.room === this.memory._pathfind?.roomRoute.roomName) {
          curRoomExit = worldRoute[index + 1];
        }
      });

      if (curRoomExit === undefined) {
        curRoomExit = worldRoute[0];
      }

      const exit = this.pos.findClosestByPath(curRoomExit.exit);
      if (exit) {
        const exitRoute = this.pos.findPathTo(exit, {
          // ignoreRoads: true
        });
        const workingSerializedRoute = Room.serializePath(exitRoute);
        this.memory._pathfind.roomRoute.path = workingSerializedRoute;
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `Room route generated for the room route for ${this.name} in ${this.pos.roomName} towards ${destinationRoomName}.`
        );
      }
    }

    const route = this.memory._pathfind.roomRoute.path;
    const moveResult = this.moveByPath(route);

    if (moveResult === -5) {
      delete this.memory._pathfind;
    }
    if (moveResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} moved towards ${destinationRoomName} from cached path successfully.`
      );
      return moveResult;
    } else {
      if (moveResult === ERR_TIRED) {
        return OK;
      }
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} has failed while moving towards ${destinationRoomName} using a cached path, with a result code of ${moveResult}.`
      );
      return moveResult;
    }
  } else {
    const centerOfDestinationRoom = new RoomPosition(25, 25, destinationRoomName);
    const direction = this.pos.getDirectionTo(centerOfDestinationRoom);
    const moveResult = this.move(direction);
    if (moveResult === OK) {
      delete this.memory._pathfind;
      Log(
        LogSeverity.INFORMATIONAL,
        "CreepTemplate",
        `${this.name} has arrived at ${destinationRoomName}`
      );
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} has moved towards center of the destination room, and pathfinding memory has been deleted`
      );
      return moveResult;
    } else {
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} has failed while moving towards the center of ${destinationRoomName}, with a result code of ${moveResult}.`
      );
      return moveResult;
    }
  }
};

function moveTo(
  this: Creep,
  x: number,
  y: number,
  opts?: MoveToOpts
): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;
function moveTo(
  this: Creep,
  target: RoomPosition | { pos: RoomPosition },
  opts?: MoveToOpts
): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;

function moveTo(
  this: Creep,
  a: number | RoomPosition | { pos: RoomPosition },
  b?: number | MoveToOpts,
  c?: MoveToOpts
) {
  // if (!Memory.heatMaps) {
  //   Memory.heatMaps = {
  //     creep: {}
  //   };
  // }
  // Example of expanding/inspecting args:
  let target: RoomPosition | { pos: RoomPosition };
  let opts: MoveToOpts | undefined;

  if (typeof a === "number") {
    const x = a;
    const y = b as number;
    opts = c;
    // do stuff with x/y/opts here
    return this._moveTo(x, y, opts);
  } else {
    target = a;
    let roomName: string;
    const roomPositionTarget = target as RoomPosition;
    if (roomPositionTarget.roomName) {
      roomName = roomPositionTarget.roomName;
      // if (!Memory.heatMaps.creep[roomName]) {
      //   Memory.heatMaps.creep[roomName] = {};
      // }

      // if (!Memory.heatMaps.creep[roomName][Game.time]) {
      //   const xArray = Array.from({ length: 50 }, (_, i) => i + 1);
      //   const yArray = Array.from({ length: 50 }, (_, i) => i + 1);

      //   const heatMap: { [key: number]: { [key: number]: number } } = {};
      //   xArray.forEach(x => {
      //     heatMap[x] = {};
      //     yArray.forEach(y => (heatMap[x][y] = 0));
      //   });

      //   Memory.heatMaps.creep[roomName][Game.time] = heatMap;
      //   console.log(JSON.stringify(Memory.heatMaps.creep[roomName][Game.time]));
      // }

      // Object.keys(Memory.heatMaps.creep[roomName][Game.time]).forEach(
      //   (time) => parseInt(time, 10) < (Game.time - 1500) && delete Memory.heatMaps.creep[roomName][Game.time]
      // );

      // Memory.heatMaps.creep[roomName][Game.time][roomPositionTarget.x][roomPositionTarget.y] =
      //   Memory.heatMaps.creep[roomName][Game.time][roomPositionTarget.x][roomPositionTarget.y] + 1;
    } else {
      const posTarget = target as { pos: RoomPosition };
      roomName = posTarget.pos.roomName;
      // if (!Memory.heatMaps.creep[roomName]) {
      //   Memory.heatMaps.creep[roomName] = {}
      // }
      // if (!Memory.heatMaps.creep[roomName][Game.time]) {

      //   const xArray = Array.from({ length: 50 }, (_, i) => i + 1);
      //   const yArray = Array.from({ length: 50 }, (_, i) => i + 1);

      //   const heatMap: { [key: number]: { [key: number]: number } } = {};
      //   xArray.forEach(x => {
      //     heatMap[x] = {};
      //     yArray.forEach(y => (heatMap[x][y] = 0));
      //   });

      //   Memory.heatMaps.creep[roomName][Game.time] = heatMap;
      //   console.log(JSON.stringify(Memory.heatMaps.creep[roomName][Game.time]));
      // }

      //  Object.keys(Memory.heatMaps.creep[roomName][Game.time]).forEach(
      // (time) => parseInt(time, 10) < (Game.time - 1500) && delete Memory.heatMaps.creep[roomName][Game.time])
      // Memory.heatMaps.creep[roomName][Game.time][posTarget.pos.x][posTarget.pos.y] =
      //   Memory.heatMaps.creep[roomName][Game.time][posTarget.pos.x][posTarget.pos.y] + 1;
    }

    opts = b as MoveToOpts | undefined;
    // do stuff with target/opts here
    if (this.pos.roomName === roomName) {
      if (this.memory._pathfind) {
        return this.moveToUnknownRoom(roomName, opts);
      } else {
        return this._moveTo(target, opts);
      }
    } else {
      return this.moveToUnknownRoom(roomName, opts);
    }
  }
}

if (!Creep.prototype._moveTo) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  Creep.prototype._moveTo = Creep.prototype.moveTo;
  Creep.prototype.moveTo = moveTo;
}
@profileClass()
export class CreepTemplate {
  // private bodyParts: BodyPartConstant[]
  public constructor() {
    //
  }
}

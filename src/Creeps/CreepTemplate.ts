/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */

import { Log, LogSeverity } from "utils/log";
import { profileClass, profileMethod } from "utils/Profiler";
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
    _harvest: (
      this: Creep,
      target: Source | Mineral<MineralConstant> | Deposit
    ) => CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES;
    _transfer(
      target: Structure<StructureConstant> | AnyCreep,
      resourceType: ResourceConstant,
      amount?: number
    ): ScreepsReturnCode;
    _pickup(target: Resource<ResourceConstant>): CreepActionReturnCode | ERR_FULL;
    _withdraw(
      target: Structure<StructureConstant> | Tombstone | Ruin,
      resourceType: ResourceConstant,
      amount?: number
    ): ScreepsReturnCode;
  }

  interface Memory {
    heatMaps: {
      creep: {
        [key: string]: { [key: number]: { [key: number]: { [key: number]: number } } };
      };
    };
  }
}

class CreepPrototypes extends Creep {
  @profileMethod
  public static mineSource(this: Creep, sourceId: Id<Source>) {
    const source = Game.getObjectById(sourceId);

    if (source) {
      if (source.energy !== 0) {
        const sourceDistance = this.pos.getRangeTo(source);
        if (sourceDistance >= 2) {
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
          if (this.pos.getRangeTo(source) > 1) return moveResult;
        }

        const harvestResult = this.harvest(source);
        if (harvestResult === OK) {
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
  }

  @profileMethod
  public static fetchDroppedEnergy(this: Creep) {
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
        .filter(resource => resource.amount > this.store.getCapacity())
        .sort((resourceA, resourceB) => resourceA.distance - resourceB.distance)[0];
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
          const closestResourceDistance = this.pos.getRangeTo(closestResource);
          if (closestResourceDistance >= 2) {
            const moveResult = this.moveTo(closestResource);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${this.name} is not in range of resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}, and has moved closer.`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${this.name} is not in range of resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            if (this.pos.getRangeTo(closestResource) > 1) return moveResult;
          }
          const pickupResult = this.pickup(closestResource);

          if (pickupResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              // `${this.name} has picked up energy from resource ${largestResource.id} in ${largestResource.pos.roomName}`
              `${this.name} has picked up energy resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              // `${this.name} has failed to pick up energy from resource ${largestResource.id} in ${largestResource.pos.roomName} with result: ${pickupResult}`
              `${this.name} has failed to pick up energy resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName} with result: ${pickupResult}`
            );
          }
          return pickupResult;
        } else return ERR_INVALID_TARGET;
      } else return ERR_NOT_FOUND;
    } else return ERR_NOT_FOUND;
  }

  @profileMethod
  public static fetchDroppedResource(this: Creep) {
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
          const closestResourceDistance = this.pos.getRangeTo(closestResource);
          if (closestResourceDistance >= 2) {
            const moveResult = this.moveTo(closestResource);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${this.name} is not in range of resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}, and has moved closer.`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${this.name} is not in range of storage ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            if (this.pos.getRangeTo(closestResource) > 1) return moveResult;
          }

          const pickupResult = this.pickup(closestResource);
          if (pickupResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} has picked up resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName}`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} has failed to pick up resource ${closestResource.resourceType} (${closestResource.id}) in ${closestResource.pos.roomName} with result: ${pickupResult}`
            );
          }
          return pickupResult;
        } else return ERR_INVALID_TARGET;
      } else return ERR_NOT_FOUND;
    } else return ERR_NOT_FOUND;
  }

  @profileMethod
  public static lootResourceFromTombstone(this: Creep, resourceType: ResourceConstant) {
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
            .sort(
              (tombstoneA, tombstoneB) => tombstoneA.distance - tombstoneB.distance
            );
          const tombstoneToLoot = Game.getObjectById(
            tombstoneDistanceMatrix[0].id as Id<Tombstone>
          );
          if (tombstoneToLoot) {
            const tombstoneToLootDistance = this.pos.getRangeTo(tombstoneToLoot);
            if (tombstoneToLootDistance >= 2) {
              const moveResult = this.moveTo(tombstoneToLoot);
              if (moveResult === OK) {
                Log(
                  LogSeverity.DEBUG,
                  "CreepTemplate",
                  `${this.name} is not in range of tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName}, and has moved closer.`
                );
              } else {
                Log(
                  LogSeverity.ERROR,
                  "CreepTemplate",
                  `${this.name} is not in range of tombstone ${tombstoneToLoot.id} in ${tombstoneToLoot.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
                );
              }
              if (this.pos.getRangeTo(tombstoneToLoot) > 1) return moveResult;
            }

            const withdrawResult = this.withdraw(tombstoneToLoot, resourceType);
            if (withdrawResult === OK) {
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
  }

  @profileMethod
  public static lootEnergyFromRuin(this: Creep) {
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
          const closestRuinDistance = this.pos.getRangeTo(closestRuin);
          if (closestRuinDistance >= 2) {
            const moveResult = this.moveTo(closestRuin);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${this.name} is not in range of ruin ${closestRuin.id} in ${closestRuin.pos.roomName}, and has moved closer.`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${this.name} is not in range of ruin ${closestRuin.id} in ${closestRuin.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            if (this.pos.getRangeTo(closestRuin) > 1) return moveResult;
          }

          const withdrawResult = this.withdraw(closestRuin, RESOURCE_ENERGY);
          if (withdrawResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "CreepTemplate",
              `${this.name} has picked up energy from ruin ${closestRuin.id} in ${closestRuin.pos.roomName}`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "CreepTemplate",
              `${this.name} has failed to pick up energy from ruin ${closestRuin.id} in ${closestRuin.pos.roomName} with result: ${withdrawResult}`
            );
          }
          return withdrawResult;
        } else return ERR_INVALID_TARGET;
      } else return ERR_NOT_FOUND;
    } else return ERR_NOT_FOUND;
  }

  @profileMethod
  public static fetchResourceFromStructure(
    this: Creep,
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
      const structureDistance = this.pos.getRangeTo(structure);
      if (structureDistance >= 2) {
        const moveResult = this.moveTo(structure);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "CreepTemplate",
            `${this.name} is not in range of structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}, and has moved closer.`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "CreepTemplate",
            `${this.name} is not in range of structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
          );
        }
        if (this.pos.getRangeTo(structure) > 1) return moveResult;
      }
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
      if (withdrawResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${this.name} has withdrawn ${resourceType} from structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${this.name} has failed to withdraw ${resourceType} from structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName} with result: ${withdrawResult}`
        );
      }
      return withdrawResult;
    }
    return ERR_INVALID_TARGET;
  }

  @profileMethod
  public static depositResourceIntoStructure(
    this: Creep,
    structure: GenericStructureWithStore,
    resourceType: ResourceConstant,
    amount?: number
  ) {
    const structureDistance = this.pos.getRangeTo(structure);
    if (structureDistance >= 2) {
      const moveResult = this.moveTo(structure);
      if (moveResult === OK) {
        Log(
          LogSeverity.DEBUG,
          "CreepTemplate",
          `${this.name} is not in range of structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}, and has moved closer.`
        );
      } else {
        Log(
          LogSeverity.ERROR,
          "CreepTemplate",
          `${this.name} is not in range of structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
        );
      }
      if (this.pos.getRangeTo(structure) > 1) return moveResult;
    }

    let cappedAmount = Math.min(
      this.store[resourceType],
      structure.store.getFreeCapacity(resourceType)
    );
    if (amount) {
      cappedAmount = Math.min(
        amount,
        this.store[resourceType],
        structure.store.getFreeCapacity(resourceType)
      );
    }

    const transferResult = this.transfer(structure, resourceType, cappedAmount);

    if (transferResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "CreepTemplate",
        `${this.name} has transfern ${resourceType} into structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName}`
      );
    } else {
      Log(
        LogSeverity.ERROR,
        "CreepTemplate",
        `${this.name} has failed to transfer ${resourceType} into structure ${structure.structureType} (${structure.id}) in ${structure.pos.roomName} with result: ${transferResult}`
      );
    }
    return transferResult;
  }

  @profileMethod
  public static fetchResourceFromStorage(
    this: Creep,
    resourceType: ResourceConstant,
    amount?: number
  ) {
    if (this.room.storage) {
      return this.fetchResourceFromStructure(this.room.storage, resourceType, amount);
    } else {
      return ERR_INVALID_TARGET;
    }
  }

  @profileMethod
  public static fetchResourceFromTerminal(
    this: Creep,
    resourceType: ResourceConstant,
    amount?: number
  ) {
    if (this.room.terminal) {
      return this.fetchResourceFromStructure(this.room.terminal, resourceType, amount);
    } else {
      return ERR_NOT_FOUND;
    }
  }

  @profileMethod
  public static fetchEnergy(this: Creep) {
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
  }

  @profileMethod
  public static moveToUnknownRoom(
    this: Creep,
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
  }
  public static moveTo(
    this: Creep,
    x: number,
    y: number,
    opts?: MoveToOpts
  ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;

  public static moveTo(
    this: Creep,
    target: RoomPosition | { pos: RoomPosition },
    opts?: MoveToOpts
  ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;

  @profileMethod
  public static moveTo(
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

  @profileMethod
  public static harvest(
    this: Creep,
    target: Source | Mineral<MineralConstant> | Deposit
  ) {
    return this._harvest(target);
  }
  @profileMethod
  public static transfer(
    this: Creep,
    target: Structure<StructureConstant> | AnyCreep,
    resourceType: ResourceConstant,
    amount?: number
  ) {
    return this._transfer(target, resourceType, amount);
  }

  @profileMethod
  public static pickup(
    this: Creep,
    target: Resource<ResourceConstant>
  ): CreepActionReturnCode | ERR_FULL {
    return this._pickup(target);
  }

  @profileMethod
  public static withdraw(
    this: Creep,
    target: Structure<StructureConstant> | Tombstone | Ruin,
    resourceType: ResourceConstant,
    amount?: number
  ): ScreepsReturnCode {
    return this._withdraw(target, resourceType, amount);
  }
}

Creep.prototype.mineSource = CreepPrototypes.mineSource;
Creep.prototype.fetchDroppedEnergy = CreepPrototypes.fetchDroppedEnergy;
Creep.prototype.fetchDroppedResource = CreepPrototypes.fetchDroppedResource;
Creep.prototype.lootResourceFromTombstone = CreepPrototypes.lootResourceFromTombstone;
Creep.prototype.lootEnergyFromRuin = CreepPrototypes.lootEnergyFromRuin;
Creep.prototype.fetchResourceFromStructure = CreepPrototypes.fetchResourceFromStructure;
Creep.prototype.depositResourceIntoStructure =
  CreepPrototypes.depositResourceIntoStructure;
Creep.prototype.fetchResourceFromStorage = CreepPrototypes.fetchResourceFromStorage;
Creep.prototype.fetchResourceFromTerminal = CreepPrototypes.fetchResourceFromTerminal;
Creep.prototype.fetchEnergy = CreepPrototypes.fetchEnergy;
Creep.prototype.moveToUnknownRoom = CreepPrototypes.moveToUnknownRoom;

if (!Creep.prototype._harvest) {
  Creep.prototype._harvest = Creep.prototype.harvest;
  Creep.prototype.harvest = CreepPrototypes.harvest;
}

if (!Creep.prototype._transfer) {
  Creep.prototype._transfer = Creep.prototype.transfer;
  Creep.prototype.transfer = CreepPrototypes.transfer;
}

if (!Creep.prototype._pickup) {
  Creep.prototype._pickup = Creep.prototype.pickup;
  Creep.prototype.pickup = CreepPrototypes.pickup;
}

if (!Creep.prototype._withdraw) {
  Creep.prototype._withdraw = Creep.prototype.withdraw;
  // Creep.prototype.withdraw = CreepPrototypes.withdraw;
}

if (!Creep.prototype._moveTo) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  Creep.prototype._moveTo = Creep.prototype.moveTo;
  Creep.prototype.moveTo = CreepPrototypes.moveTo;
}
if (!Creep.prototype._moveTo) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  Creep.prototype._moveTo = Creep.prototype.moveTo;
  Creep.prototype.moveTo = CreepPrototypes.moveTo;
}
@profileClass()
export class CreepTemplate {
  // private bodyParts: BodyPartConstant[]
  public constructor() {
    //
  }
}

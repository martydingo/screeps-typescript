/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { findPath } from "common/findPath";
import { Log } from "./Log";

export class BaseCreep {
  public constructor(creep: Creep) {
    //
  }
  public checkIfFull(creep: Creep, resource: ResourceConstant): void {
    if (creep.memory.status === "fetchingResource") {
      if (creep.store[resource] === creep.store.getCapacity(resource)) {
        creep.memory.status = "working";
      }
    } else if (creep.memory.status === "working") {
      if (creep.store[resource] === 0) {
        creep.memory.status = "fetchingResource";
      }
    }
  }
  public moveHome(creep: Creep): void {
    if (creep.memory.status === "working" || creep.memory.status === "fetchingResource") {
      if (creep.pos.roomName !== creep.memory.room) {
        creep.memory.status = "movingIntoRoom";
      }
    }
    if (creep.memory.status === "movingIntoRoom") {
      if (creep.pos.roomName === creep.memory.room) {
        creep.memory.status = "working";
      } else {
        const safeRouteHome = findPath.findSafePathToRoom(creep.pos.roomName, creep.memory.room);
        if (safeRouteHome !== -2) {
          this.moveCreep(creep, new RoomPosition(25, 25, safeRouteHome[0].room));
        } else {
          Log.Warning(`${creep.memory.jobType} creep with UUID ${creep.name} returned ${safeRouteHome}`);
        }
      }
    }
  }
  public moveCreep(creep: Creep, destination: RoomPosition): ScreepsReturnCode {
    const moveResult = creep.moveTo(destination, {
      visualizePathStyle: {
        fill: "transparent",
        stroke: "#efefef",
        lineStyle: "dashed",
        strokeWidth: 0.15,
        opacity: 0.6
      }
    });
    return moveResult;
  }
  public harvestSource(creep: Creep, source: Source): ScreepsReturnCode {
    const harvestResult = creep.harvest(source);
    if (harvestResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveCreep(creep, source.pos);
      return moveResult;
    } else {
      return harvestResult;
    }
  }
  public pickupResource(creep: Creep, origin: Resource<ResourceConstant>): ScreepsReturnCode {
    const pickupResult = creep.pickup(origin);
    if (pickupResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveCreep(creep, origin.pos);
      return moveResult;
    } else return pickupResult;
  }
  public withdrawResource(
    creep: Creep,
    origin: StructureStorage | StructureContainer | StructureLink,
    resource: ResourceConstant
  ): ScreepsReturnCode {
    const withdrawResult = creep.withdraw(origin, resource);
    if (withdrawResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveCreep(creep, origin.pos);
      return moveResult;
    } else return withdrawResult;
  }
  public fetchSource(creep: Creep, forceStorage = false): void {
    const linkDistances: { [key: Id<StructureLink>]: number } = {};
    let sortedLinkDistances: [string, number][] = [];
    let storageUsable = false;
    let linksUsable = false;
    let useStorage = false;
    let useLinks = false;
    if (forceStorage) {
      useStorage = true;
    } else {
      if (creep.room.memory.monitoring.structures.links) {
        if (
          Object.entries(creep.room.memory.monitoring.structures.links).filter(
            ([, cachedLink]) => cachedLink.mode === "rx" && cachedLink.energy.energyAvailable > 0
          ).length > 0
        ) {
          linksUsable = true;
        }
      }
      if (creep.room.memory.monitoring.structures.storage) {
        if (creep.room.memory.monitoring.structures.storage.resources[RESOURCE_ENERGY]) {
          if (
            creep.room.memory.monitoring.structures.storage.resources[RESOURCE_ENERGY].resourceAmount >=
            creep.store.getFreeCapacity(RESOURCE_ENERGY)
          ) {
            storageUsable = true;
          }
        }
      }
    }
    if (storageUsable || linksUsable) {
      if (!linksUsable) {
        useStorage = true;
      } else {
        if (!storageUsable) {
          useLinks = true;
        } else {
          Object.entries(creep.room.memory.monitoring.structures.links)
            .filter(([, cachedLink]) => cachedLink.mode === "rx" && cachedLink.energy.energyAvailable > 0)
            .forEach(([cachedLinkIdString]) => {
              const cachedLinkId = cachedLinkIdString as Id<StructureLink>;
              const cachedLink = Game.getObjectById(cachedLinkId);
              if (cachedLink) {
                linkDistances[cachedLinkId] = creep.pos.getRangeTo(cachedLink);
              }
            });
          if (Object.entries(linkDistances).length > 0) {
            sortedLinkDistances = Object.entries(linkDistances).sort(
              ([, linkDistanceA], [, linkDistanceB]) => linkDistanceA - linkDistanceB
            );
            if (sortedLinkDistances[0]) {
              if (creep.room.storage) {
                const storageDistance = creep.pos.getRangeTo(creep.room.storage.pos);
                if (storageDistance <= sortedLinkDistances[0][1]) {
                  useStorage = true;
                } else {
                  useLinks = true;
                }
              }
            }
          }
        }
      }
    }
    if (useLinks === true) {
      if (Object.entries(sortedLinkDistances)[0]) {
        const linkId = sortedLinkDistances[0][0] as Id<StructureLink>;
        const link = Game.getObjectById(linkId);
        if (link) {
          this.withdrawResource(creep, link, RESOURCE_ENERGY);
        }
      }
    } else {
      if (useStorage === true) {
        if (creep.room.memory.monitoring.structures.storage) {
          const storageId = creep.room.memory.monitoring.structures.storage.id;
          const storage = Game.getObjectById(storageId);
          if (storage) {
            this.withdrawResource(creep, storage, RESOURCE_ENERGY);
          }
        }
      } else {
        const droppedResourceArray: Resource<ResourceConstant>[] = [];
        Object.entries(creep.room.memory.monitoring.droppedResources)
          .filter(DroppedResource => DroppedResource[1].resourceType === RESOURCE_ENERGY)
          .forEach(([droppedResourceId]) => {
            const droppedResource = Game.getObjectById(droppedResourceId as Id<Resource<ResourceConstant>>);
            if (droppedResource) {
              droppedResourceArray.push(droppedResource);
            }
          });
        if (droppedResourceArray.length > 0) {
          const closestDroppedEnergy = creep.pos.findClosestByPath(droppedResourceArray);
          if (closestDroppedEnergy) {
            this.pickupResource(creep, closestDroppedEnergy);
          }
        }
      }
    }
  }

  public depositResource(
    creep: Creep,
    destination: Structure<StructureConstant> | AnyCreep,
    resource: ResourceConstant
  ): ScreepsReturnCode {
    const depositResult = creep.transfer(destination, resource);
    if (depositResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveCreep(creep, destination.pos);
      return moveResult;
    } else return depositResult;
  }
}

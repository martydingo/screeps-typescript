import { config } from "config";
import { TransportCreep } from "Creeps/TransportCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";


export class ResourceDaemon {
  @profileClass("ResourceDaemon")
  public static run() {
    this.manageLocalLootTransportCreepJobs();
    this.manageMiningLootTransportCreepJobs();
    this.manageRemoteStorageTransportCreepJobs();
  }
  @profileMethod
  private static manageLocalLootTransportCreepJobs() {
    Object.entries(global.store.rooms).forEach(([roomName, roomMemory]) => {
      const roomResources = roomMemory.resources;
      if (roomResources) {
        if (Object.keys(roomResources).length > 0) {
          const room = Game.rooms[roomName];
          if (room) {
            if (room.storage) {
              const sourceAnchorFlags = Object.entries(Game.flags).filter(
                ([flagName, flag]) =>
                  flagName.includes("source-anchor") && flag.pos.roomName === roomName
              );
              if (sourceAnchorFlags.length === 0) {
                Log(
                  LogSeverity.DEBUG,
                  "ResourceDaemon",
                  `Storage but no anchor points detected in ${roomName}, assuming the room needs a transport creep`
                );
                const assignedCreeps = Object.values(Game.creeps).filter(
                  creep =>
                    global.store.creeps[creep.name].room === room.name && global.store.creeps[creep.name].origin === "loot"
                );
                const spawnJobs = Object.values(global.store.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job =>
                    job.params.memory.room === room.name &&
                    job.params.memory.origin === "loot"
                );
                const requestedCreeps = 2;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ResourceDaemon",
                    `Number of transport creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );
                  global.store.jobs[`TransportCreep-${roomName}-${Game.time}`] = {
                    type: "spawn",
                    name: `TransportCreep-${roomName}-${Game.time}`,
                    bodyPartRatio: TransportCreep.bodyPartRatio,
                    status: "pending",
                    priority: 4,
                    params: {
                      memory: {
                        type: "TransportCreep",
                        room: roomName,
                        origin: "loot",
                        destination: room.storage.id,
                        resourceType: RESOURCE_ENERGY,
                        curTask: "spawning"
                      }
                    }
                  };
                  Log(
                    LogSeverity.INFORMATIONAL,
                    "ResourceDaemon",
                    `Transport creep spawn job created in ${roomName} at ${Game.time}`
                  );
                }
              }
            }
          }
        }
      }
    });
  }

  @profileMethod
  private static manageMiningLootTransportCreepJobs() {
    config[global.store.env].roomsToMine.forEach(roomName => {
      const roomMemory = global.store.rooms[roomName];
      if (roomMemory) {
        let hostilesInRoom = false;
        const hostiles = roomMemory.hostiles;
        if (hostiles) {
          if (Object.keys(hostiles).length > 0) {
            hostilesInRoom = true;
          }
        }
        // console.log(roomName)
        // console.log(hostilesInRoom)
        if (hostilesInRoom === false) {
          const droppedResources = roomMemory.resources;
          if (droppedResources) {
            let totalAmount = 0;
            const totalAmounts = Object.values(droppedResources).map(
              resourceMonitorMemory => resourceMonitorMemory.amount
            );
            totalAmounts.forEach(amount => (totalAmount = totalAmount + amount));

            if (totalAmount > 500) {
              const allStorages = Object.values(Game.structures).filter(
                structure => structure.structureType === STRUCTURE_STORAGE
              ) as StructureStorage[];

              const storageDistanceMatrix = allStorages
                .map(storage => {
                  const distance = Game.map.findRoute(roomName, storage.pos.roomName);
                  if (distance !== -2) {
                    return {
                      storage,
                      distance: distance.length
                    };
                  } else {
                    return {
                      storage,
                      distance: 65535
                    };
                  }
                })
                .sort((storageA, storageB) => storageA.distance - storageB.distance);
              if (storageDistanceMatrix.length > 0) {
                const closestStorage = storageDistanceMatrix[0];
                Log(
                  LogSeverity.DEBUG,
                  "ResourceDaemon",
                  `Storage but no anchor points detected in ${roomName}, assuming the room needs a transport creep`
                );
                const assignedCreeps = Object.values(Game.creeps).filter(
                  creep =>
                    global.store.creeps[creep.name].room === roomName &&
                    global.store.creeps[creep.name].origin === "loot" &&
                    global.store.creeps[creep.name].destination === closestStorage.storage.id
                );
                const spawnJobs = Object.values(global.store.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job =>
                    job.params.memory.room === roomName &&
                    job.params.memory.origin === "loot" &&
                    job.params.memory.destination === closestStorage.storage.id
                );
                const requestedCreeps = 2;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ResourceDaemon",
                    `Number of transport creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );
                  global.store.jobs[`TransportCreep-${roomName}-${Game.time}`] = {
                    type: "spawn",
                    name: `TransportCreep-${roomName}-${Game.time}`,
                    bodyPartRatio: TransportCreep.bodyPartRatio,
                    status: "pending",
                    priority: 4 + assignedCreeps.length,
                    params: {
                      memory: {
                        type: "TransportCreep",
                        room: roomName,
                        origin: "loot",
                        destination: closestStorage.storage.id,
                        resourceType: RESOURCE_ENERGY,
                        curTask: "spawning"
                      }
                    }
                  };
                  Log(
                    LogSeverity.INFORMATIONAL,
                    "ResourceDaemon",
                    `Transport creep spawn job created in ${roomName} at ${Game.time}`
                  );
                }
              }
            }
          }
        }
      }
    });
  }

  @profileMethod
  private static manageRemoteStorageTransportCreepJobs() {
    const storages = Object.values(Game.structures).filter(
      structure => structure.structureType === STRUCTURE_STORAGE
    ) as StructureStorage[];

    if (storages.length >= 2) {
      const storageDistanceAmountMatrix = Object.values(storages).map(storage => {
        return {
          storage,
          amount: {
            amount: storage.store[RESOURCE_ENERGY],
            capacity: storage.store.getCapacity(RESOURCE_ENERGY)
          },
          distances: Object.values(storages)
            .filter(nearbyStorage => nearbyStorage.id !== storage.id)
            .map(nearbyStorage => {
              return {
                storage: nearbyStorage,
                distance: Game.map.getRoomLinearDistance(
                  storage.pos.roomName,
                  nearbyStorage.pos.roomName
                )
              };
            })
        };
      });

      storageDistanceAmountMatrix.forEach(storageEntry => {
        if (storageEntry.amount.amount / storageEntry.amount.capacity >= 0.5) {
          storageEntry.distances.forEach(nearbyStorageEntry => {
            const nearbyStorageAmount =
              nearbyStorageEntry.storage.store[RESOURCE_ENERGY];
            const nearbyStorageCapacity =
              nearbyStorageEntry.storage.store.getCapacity(RESOURCE_ENERGY);

            if (nearbyStorageAmount / nearbyStorageCapacity < 0.1) {
              if (nearbyStorageEntry.distance <= 2) {
                const assignedCreeps = Object.values(Game.creeps).filter(
                  creep =>
                    global.store.creeps[creep.name].room === storageEntry.storage.pos.roomName &&
                    global.store.creeps[creep.name].origin === storageEntry.storage.id &&
                    global.store.creeps[creep.name].destination === nearbyStorageEntry.storage.id
                );

                const spawnJobs = Object.values(global.store.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job =>
                    job.params.memory.room === storageEntry.storage.pos.roomName &&
                    job.params.memory.origin === storageEntry.storage.id &&
                    job.params.memory.destination === nearbyStorageEntry.storage.id
                );
                const requestedCreeps = 0;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ResourceDaemon",
                    `Number of transport creeps in $${storageEntry.storage.pos.roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );
                  global.store.jobs[
                    `TransportCreep-${storageEntry.storage.pos.roomName}-${nearbyStorageEntry.storage.id}-${Game.time}`
                  ] = {
                    type: "spawn",
                    name: `TransportCreep-${storageEntry.storage.pos.roomName}-${nearbyStorageEntry.storage.id}-${Game.time}`,
                    bodyPartRatio: TransportCreep.bodyPartRatio,
                    status: "pending",
                    priority: 3 + assignedCreeps.length,
                    params: {
                      memory: {
                        type: "TransportCreep",
                        room: storageEntry.storage.pos.roomName,
                        origin: storageEntry.storage.id,
                        destination: nearbyStorageEntry.storage.id,
                        resourceType: RESOURCE_ENERGY,
                        curTask: "spawning"
                      }
                    }
                  };
                  Log(
                    LogSeverity.INFORMATIONAL,
                    "ResourceDaemon",
                    `Transport creep spawn job created in ${storageEntry.storage.pos.roomName} at ${Game.time}`
                  );
                }
              }
            }
          });
        }
      });
    }
  }
}

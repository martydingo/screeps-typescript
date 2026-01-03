import { config } from "config";
import { TransportCreep } from "Creeps/TransportCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class ResourceDaemon {
  public constructor() {
    this.manageLocalLootTransportCreepJobs();
    this.manageMiningLootTransportCreepJobs();
    this.manageRemoteStorageTransportCreepJobs();
  }
  private manageLocalLootTransportCreepJobs() {
    Object.entries(Memory.rooms).forEach(([roomName, roomMemory]) => {
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
                    creep.memory.room === room.name && creep.memory.origin === "loot"
                );
                const spawnJobs = Object.values(Memory.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job =>
                    job.params.memory.room === room.name &&
                    job.params.memory.origin === "loot"
                );
                const requestedCreeps = 1;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ResourceDaemon",
                    `Number of transport creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );
                  Memory.jobs[`TransportCreep-${roomName}-${Game.time}`] = {
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

  private manageMiningLootTransportCreepJobs() {
    config[Memory.env].roomsToMine.forEach(roomName => {
      const roomMemory = Memory.rooms[roomName];
      if (roomMemory) {
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
                  }
                } else {
                  return {
                    storage,
                    distance: 65535
                  }
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
                  creep.memory.room === roomName &&
                  creep.memory.origin === "loot" &&
                  creep.memory.destination === closestStorage.storage.id
              );
              const spawnJobs = Object.values(Memory.jobs).filter(
                job => job.type === "spawn"
              ) as SpawnJob[];

              const assignedJobs = spawnJobs.filter(
                job =>
                  job.params.memory.room === roomName &&
                  job.params.memory.origin === "loot" &&
                  job.params.memory.destination === closestStorage.storage.id
              );
              const requestedCreeps = 1;
              if (
                assignedCreeps.length < requestedCreeps &&
                assignedJobs.length === 0
              ) {
                Log(
                  LogSeverity.DEBUG,
                  "ResourceDaemon",
                  `Number of transport creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                );
                Memory.jobs[`TransportCreep-${roomName}-${Game.time}`] = {
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
    });
  }

  private manageRemoteStorageTransportCreepJobs() {
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
                    creep.memory.room === storageEntry.storage.pos.roomName &&
                    creep.memory.origin === storageEntry.storage.id &&
                    creep.memory.destination === nearbyStorageEntry.storage.id
                );

                const spawnJobs = Object.values(Memory.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job =>
                    job.params.memory.room === storageEntry.storage.pos.roomName &&
                    job.params.memory.origin === storageEntry.storage.id &&
                    job.params.memory.destination === nearbyStorageEntry.storage.id
                );
                const requestedCreeps = 1;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ResourceDaemon",
                    `Number of transport creeps in $${storageEntry.storage.pos.roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );
                  Memory.jobs[
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

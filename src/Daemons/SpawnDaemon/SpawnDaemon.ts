import { MaxBodyParts, Ratio, buildBodyFromRatio } from "utils/buildBodyFromRatio";
import { SpawnCreep } from "Creeps/SpawnCreep";
// import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface SpawnJob {
  type: "spawn";
  name: string;
  bodyPartRatio: Ratio;
  maxBodyParts?: MaxBodyParts;
  status: string;
  priority: number;
  params: {
    memory: CreepMemory;
  };
}

declare global {
  interface Memory {
    spawnHeld: { [key: string]: number };
  }
}

// @profileClass()
export class SpawnDaemon {
  public static run() {
    this.manageSpawnCreepJobs();

    Log(
      LogSeverity.DEBUG,
      "SpawnDaemon",
      `There are ${
        Object.entries(Memory.jobs).filter(
          ([, job]) => job.type === "spawn" && job.status === "pending"
        ).length
      } pending spawn jobs`
    );
    const priorityLevels = new Set();
    const spawnJobs: [string, SpawnJob][] = Object.entries(Memory.jobs).filter(
      ([, job]) => job.type === "spawn"
    ) as [string, SpawnJob][];

    spawnJobs
      .map(([, spawnJob]) => spawnJob.priority)
      .sort()
      .forEach(priorityLevel => priorityLevels.add(priorityLevel));

    const roomNames: Set<string> = new Set();
    spawnJobs
      .map(([, spawnJob]) => spawnJob.params.memory.room)
      .forEach(roomName => roomNames.add(roomName as string));

    roomNames.forEach(roomName => {
      let haltSpawn = false;
      let spawnerJobs: [string, SpawnJob][] = [];
      priorityLevels.forEach(priorityLevel => {
        if (haltSpawn === false) {
          const curSpawnJobs = spawnJobs.filter(
            ([, job]) =>
              job.type === "spawn" &&
              job.status === "pending" &&
              job.priority === priorityLevel &&
              job.params.memory.room === roomName
          );
          if (curSpawnJobs.length > 0) {
            spawnerJobs = curSpawnJobs;
            haltSpawn = true;
          }
        }
      });

      spawnerJobs.forEach(([spawnJobId, spawnJob]) => {
        const spawnersInRoom = Object.values(Game.spawns).filter(
          spawner => spawner.room.name === roomName
        );

        let spawn;

        if (spawnersInRoom.length > 0) {
          spawn = spawnersInRoom.filter(spawner => spawner.spawning === null)[0];
          if (spawn) {
            Log(
              LogSeverity.DEBUG,
              "SpawnDaemon",
              `Spawn ${spawn.name} found locally within room ${roomName}`
            );
          }
        } else {
          spawn = this.findClosestSpawn(roomName);
          if (spawn) {
            Log(
              LogSeverity.DEBUG,
              "SpawnDaemon",
              `Spawn not found within room ${roomName}. ${spawn.name} will be used instead.`
            );
          }
        }

        if (spawn) {
          const desiredBodyParts = buildBodyFromRatio({
            ratio: spawnJob.bodyPartRatio,
            energyAvailable: spawn.room.energyCapacityAvailable,
            maxBodyParts: spawnJob.maxBodyParts || {
              tough: 50,
              move: 50,
              work: 50,
              carry: 50,
              attack: 50,
              // eslint-disable-next-line camelcase
              ranged_attack: 50,
              heal: 50,
              claim: 50
            }
          });

          const shouldSpawn = this.waitUntilFullCapacity(spawn, desiredBodyParts);

          if (shouldSpawn === true) {
            const bodyParts = buildBodyFromRatio({
              ratio: spawnJob.bodyPartRatio,
              energyAvailable: spawn.room.energyAvailable,
              maxBodyParts: spawnJob.maxBodyParts || {
                tough: 50,
                move: 50,
                work: 50,
                carry: 50,
                attack: 50,
                // eslint-disable-next-line camelcase
                ranged_attack: 50,
                heal: 50,
                claim: 50
              }
            });

            const spawnCost = this.discernCost(bodyParts);
            if (
              spawn.room.memory.energy!.amount >= spawnCost &&
              spawnCost <= spawn.room.memory.energy!.capacity
            ) {
              const spawnResult = spawn.spawnCreep(bodyParts, spawnJob.name, {
                memory: spawnJob.params.memory
              });

              if (spawnResult === OK) {
                delete Memory.jobs[spawnJobId];
              }
            }
          }
        }
      });
    });

    // const spawnJobs = Object.entries(Memory.jobs)
    //   .filter(([, job]) => job.type === "spawn" && job.status === "pending")
    //   .sort(([, spawnJobA], [, spawnJobB]) => spawnJobA.priority - spawnJobB.priority);
  }

  // @profileMethod
  private static waitUntilFullCapacity (
    spawn: StructureSpawn,
    desiredBodyParts: BodyPartConstant[]
  ): boolean {
    if (!Memory.spawnHeld) {
      Memory.spawnHeld = {};
      Log(
        LogSeverity.DEBUG,
        "SpawnDaemon",
        `spawnHeld memory not found, spawnHeld memory initialised.`
      );
    }
    const spawnCreeps = Object.values(Game.creeps).filter(
      creep =>
        creep.memory.room === spawn.pos.roomName && creep.memory.type === "SpawnCreep"
    );

    if (spawnCreeps.length === 0) {
      delete Memory.spawnHeld[spawn.room.name];
      Log(
        LogSeverity.DEBUG,
        "SpawnDaemon",
        `No spawn creeps in ${spawn.room.name}, no further increase of spawn energy possible, allowing spawn`
      );
      return true;
    } else {
      const bodyPartCost = this.discernCost(desiredBodyParts);
      if (bodyPartCost <= spawn.room.energyAvailable) {
        delete Memory.spawnHeld[spawn.room.name];
        Log(
          LogSeverity.DEBUG,
          "SpawnDaemon",
          `Spawn energy in room ${spawn.room.name} (${spawn.room.energyAvailable}) is equal or above desired body part cost ${bodyPartCost}, allowing spawn`
        );
        return true;
      } else {
        if (spawn.room.energyAvailable === spawn.room.energyCapacityAvailable) {
          delete Memory.spawnHeld[spawn.room.name];
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Spawn energy in room ${spawn.room.name} matches capacity, allowing spawn`
          );
          return true;
        } else {
          if (!Memory.spawnHeld[spawn.room.name]) {
            Memory.spawnHeld[spawn.room.name] = Game.time;
            Log(
              LogSeverity.DEBUG,
              "SpawnDaemon",
              `Spawn energy in room ${
                spawn.room.name
              } is under capacity, delaying spawn until ${Game.time + 300}`
            );
            return false;
          } else {
            if (Game.time - Memory.spawnHeld[spawn.room.name] >= 450) {
              Log(
                LogSeverity.DEBUG,
                "SpawnDaemon",
                `Spawn energy in room ${
                  spawn.room.name
                } is still under capacity, but it has been longer then 300 ticks since ${
                  Memory.spawnHeld[spawn.pos.roomName]
                } (cur: ${Game.time}), proceeding with spawn`
              );
              delete Memory.spawnHeld[spawn.room.name];
              return true;
            } else {
              Log(
                LogSeverity.DEBUG,
                "SpawnDaemon",
                `Spawn energy in room ${
                  spawn.room.name
                } is still under capacity, and it has not yet been longer then 300 ticks since ${
                  Memory.spawnHeld[spawn.pos.roomName]
                } (cur: ${Game.time}), delaying spawn`
              );
              return false;
            }
          }
        }
      }
    }
  }

  // @profileMethod
  private static findClosestSpawn(roomName: string) {
    Object.values(Game.spawns).forEach(spawn => {
      if (!spawn.memory.distances) {
        spawn.memory.distances = {};
      }

      if (!spawn.memory.distances[roomName]) {
        const distance = Object.values(
          Game.map.findRoute(roomName, spawn.room.name)
        ).length;
        spawn.memory.distances[roomName] = distance;
      }
    });
    const spawnDistanceMatrix = Object.values(Game.spawns)
      .map(spawn => {
        return {
          spawn,
          distance: spawn.memory.distances[roomName]
        };
      })
      .sort(
        (spawnDistanceA, spawnDistanceB) =>
          spawnDistanceA.distance - spawnDistanceB.distance
      );

    Object.values(spawnDistanceMatrix).forEach(spawnDistanceEntry => {
      spawnDistanceEntry.spawn.memory.distances[roomName] = spawnDistanceEntry.distance;
    });

    return spawnDistanceMatrix.reverse().pop()?.spawn;
  }

  // @profileMethod
  private static manageSpawnCreepJobs() {
    Object.values(Game.spawns)
      .map(spawn => spawn.room.name)
      .forEach(roomName => {
        const assignedCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.room === roomName && creep.memory.type === "SpawnCreep"
        );
        const spawnJobs = Object.values(Memory.jobs).filter(
          job => job.type === "spawn"
        ) as SpawnJob[];

        const assignedJobs = spawnJobs.filter(
          job =>
            job.params.memory.room === roomName &&
            job.params.memory.type === "SpawnCreep"
        );

        // const spawnJobs = Object.values(Memory.jobs).filter(job => job.type === "spawn") as SpawnJob[];
        // const assignedJobs = spawnJobs.filter(
        //   job => job.params.memory.room === roomName && job.params.memory.type === "SpawnCreep"
        // );

        const requestedCreeps = 1;
        if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
          //
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Number of spawn creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
          );
          Memory.jobs[`SpawnCreep-${roomName}-${Game.time}`] = {
            type: "spawn",
            name: `SpawnCreep-${roomName}-${Game.time}`,
            bodyPartRatio: SpawnCreep.bodyPartRatio,
            status: "pending",
            priority: this.determineSpawnCreepPriority(roomName),
            params: {
              memory: {
                type: "SpawnCreep",
                room: roomName,
                assignedRoom: roomName,
                curTask: "spawning"
              }
            }
          };
          Log(
            LogSeverity.INFORMATIONAL,
            "SpawnDaemon",
            `Spawn creep spawn job created in ${roomName} at ${Game.time}`
          );
        }
      });
  }

  // @profileMethod
  private static determineSpawnCreepPriority(roomName: string): 1 | 2 {
    const energyThreshold = 1000;
    let energyInRoom = false;

    const room = Game.rooms[roomName];

    if (room) {
      const storage = room.storage;
      if (storage) {
        if (storage.store[RESOURCE_ENERGY] > energyThreshold) {
          energyInRoom = true;
        }
      }

      if (energyInRoom === false) {
        const roomMemory = Memory.rooms[roomName];
        if (roomMemory) {
          const resourceMemory = roomMemory.resources;
          if (resourceMemory) {
            const energyResources = Object.values(resourceMemory).filter(
              resource => resource.resource === RESOURCE_ENERGY
            );
            if (energyResources.length > 0) {
              let energyAmountInRoom = 0;
              energyResources.forEach(
                resource => (energyAmountInRoom = energyAmountInRoom + resource.amount)
              );
              if (energyAmountInRoom > energyThreshold) {
                energyInRoom = true;
              }
            }
          }
        }
      }
    }

    const spawnCreepCount = Object.values(Game.creeps).filter(
      creep => creep.memory.room === roomName && creep.memory.type === "SpawnCreep"
    ).length;
    if (spawnCreepCount === 0) {
      if (energyInRoom === true) {
        return 1;
      } else return 2;
    } else return 2;
  }

  // @profileMethod
  private static discernCost(bodyParts: BodyPartConstant[]) {
    const costMatrix = {
      tough: 10,
      move: 50,
      work: 100,
      carry: 50,
      attack: 80,
      // eslint-disable-next-line camelcase
      ranged_attack: 150,
      heal: 250,
      claim: 600
    };

    let cost = 0;

    bodyParts.forEach(partName => (cost = cost + costMatrix[partName]));

    return cost;
  }
}

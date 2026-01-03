import { config } from "config";
import { SourceCreep } from "Creeps/SourceCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class SourceDaemon {
  public constructor() {
    Object.keys(Memory.rooms).forEach(roomName => {
      let shouldMine = false;
      if (Game.rooms[roomName]) {
        if (Game.rooms[roomName].controller) {
          const roomControlled = Game.rooms[roomName].controller!.my;
          if (roomControlled === true) {
            shouldMine = true;
          }
        }
      }

      if (config[Memory.env].roomsToMine.includes(roomName)) {
        const room = Game.rooms[roomName]
        if (room) {
          const controller = room.controller
          if (controller) {
            const reservation = controller.reservation
            if (reservation) {
              if (reservation.ticksToEnd > 0) {
                shouldMine = true
              }
            }
          } else {
            shouldMine = true
          }
        }
        shouldMine = true;
      }

      if (shouldMine === true) {
        Log(LogSeverity.DEBUG, "SourceDaemon", `Mining sources in ${roomName}`);
        Object.keys(Memory.rooms[roomName].sources!).forEach(sourceId => {
          const spawnJobs = Object.values(Memory.jobs).filter(job => job.type === "spawn") as SpawnJob[];
          const assignedCreeps = Object.values(Game.creeps).filter(creep => creep.memory.assignedSource === sourceId);
          const assignedJobs = spawnJobs.filter(job => job.params.memory.assignedSource === sourceId);
          const requestedCreeps = 1;
          if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
            Log(
              LogSeverity.DEBUG,
              "SourceDaemon",
              `Number of source creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
            );
            Memory.jobs[`SourceCreep-${sourceId}-${Game.time}`] = {
              type: "spawn",
              name: `SourceCreep-${sourceId}-${Game.time}`,
              //   bodyParts: SourceCreep.bodyParts[roomLevel],
              bodyPartRatio: SourceCreep.bodyPartRatio,
              maxBodyParts: SourceCreep.maxBodyParts,
              status: "pending",
              priority: this.determineSpawnCreepPriority(roomName),
              params: {
                memory: {
                  type: "SourceCreep",
                  room: roomName,
                  assignedSource: sourceId as Id<Source>,
                  curTask: "spawning"
                }
              }
            };
            Log(
              LogSeverity.INFORMATIONAL,
              "SourceDaemon",
              `Source creep spawn job for ${sourceId} created in ${roomName} at ${Game.time}`
            );
          }
        });
      }
    });
  }
  private determineSpawnCreepPriority(roomName: string): 1 | 2 {
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
              energyResources.forEach(resource => (energyAmountInRoom = energyAmountInRoom + resource.amount));
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
        return 2;
      } else return 1;
    } else return 1;
  }
}

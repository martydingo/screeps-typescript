import { config } from "config";
import { ClaimCreep } from "Creeps/ClaimCreep";
import { ControllerCreep } from "Creeps/ControllerCreep";
import { ReserveCreep } from "Creeps/ReserveCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class ControllerDaemon {
  public constructor() {
    this.manageUpgradeCreeps();
    this.manageReserveCreeps();
    this.manageClaimCreeps();
  }

  private manageUpgradeCreeps() {
    Object.keys(Memory.rooms).forEach(roomName => {
      if (Memory.rooms[roomName].controller) {
        Object.keys(Memory.rooms[roomName].controller!).forEach(
          controllerId => {
            const controller = Game.getObjectById(
              controllerId as Id<StructureController>
            );
            if (controller) {
              if (controller.my) {
                const assignedCreeps = Object.values(Game.creeps).filter(
                  creep => creep.memory.assignedController === controllerId
                );
                const spawnJobs = Object.values(Memory.jobs).filter(
                  job => job.type === "spawn"
                ) as SpawnJob[];

                const assignedJobs = spawnJobs.filter(
                  job => job.params.memory.assignedController === controllerId
                );
                const storage = controller.room.storage;
                // const requestedCreeps = (storage && Math.max(1, ceil(storage.store[RESOURCE_ENERGY] / 200000))) || 1;
                const requestedCreeps =
                  (storage && storage.store[RESOURCE_ENERGY] > 200000 && 2) ||
                  1;
                if (
                  assignedCreeps.length < requestedCreeps &&
                  assignedJobs.length === 0
                ) {
                  Log(
                    LogSeverity.DEBUG,
                    "ControllerDaemon",
                    `Number of controller creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
                  );

                  Memory.jobs[`ControllerCreep-${controllerId}-${Game.time}`] =
                    {
                      type: "spawn",
                      name: `ControllerCreep-${controllerId}-${Game.time}`,
                      bodyPartRatio: ControllerCreep.bodyPartRatio,
                      status: "pending",
                      priority: 3,
                      params: {
                        memory: {
                          type: "ControllerCreep",
                          room: roomName,
                          assignedController:
                            controllerId as Id<StructureController>,
                          curTask: "spawning"
                        }
                      }
                    };
                  Log(
                    LogSeverity.INFORMATIONAL,
                    "ControllerDaemon",
                    `Controller creep spawn job created for ${controller.id} in ${roomName} at ${Game.time}`
                  );
                }
              }
            }
          }
        );
      }
    });
  }
  private manageClaimCreeps() {
    const roomsToClaim = config[Memory.env].roomsToClaim;
    roomsToClaim.forEach(roomName => {
      let claimRoom = false;
      const room = Game.rooms[roomName];
      if (room) {
        if (room.controller) {
          if (!room.controller.my) {
            claimRoom = true;
          }
        }
      } else {
        claimRoom = true;
      }

      if (claimRoom === true) {
        const assignedCreeps = Object.values(Game.creeps).filter(
          creep =>
            creep.memory.type === "ClaimCreep" && creep.memory.room === roomName
        );
        const spawnJobs = Object.values(Memory.jobs).filter(
          job => job.type === "spawn"
        ) as SpawnJob[];

        const assignedJobs = spawnJobs.filter(
          job =>
            job.params.memory.type === "ClaimCreep" &&
            job.params.memory.room === roomName
        );
        const requestedCreeps = 1;
        if (
          assignedCreeps.length < requestedCreeps &&
          assignedJobs.length === 0
        ) {
          Log(
            LogSeverity.DEBUG,
            "ControllerDaemon",
            `Number of claim creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
          );
          Memory.jobs[`ClaimCreep-${roomName}-${Game.time}`] = {
            type: "spawn",
            name: `ClaimCreep-${roomName}-${Game.time}`,
            bodyPartRatio: ClaimCreep.bodyPartRatio,
            maxBodyParts: ClaimCreep.maxBodyParts,
            status: "pending",
            priority: 3,
            params: {
              memory: {
                type: "ClaimCreep",
                room: roomName,
                curTask: "spawning"
              }
            }
          };
          Log(
            LogSeverity.INFORMATIONAL,
            "ControllerDaemon",
            `Claim creep spawn job created for ${roomName} at ${Game.time}`
          );
        }
      }
    });
  }
  private manageReserveCreeps() {
    const roomsToMine = config[Memory.env].roomsToMine;
    roomsToMine.forEach(roomName => {
      let reserveRoom = false;
      const room = Game.rooms[roomName];
      if (room) {
        if (room.controller) {
          if (!room.controller.my) {
            reserveRoom = true;
          }
          if (!room.controller.reservation) {
            reserveRoom = true;
          } else {
            if (
              room.controller.reservation.username ===
              config[Memory.env].username
            ) {
              if (room.controller.reservation.ticksToEnd < 1000) {
                reserveRoom = true;
              }
            } else {
              reserveRoom = true;
            }
          }
        }
      } else {
        reserveRoom = true;
      }
      if (reserveRoom === true) {
        const assignedCreeps = Object.values(Game.creeps).filter(
          creep =>
            creep.memory.type === "ReserveCreep" &&
            creep.memory.room === roomName
        );
        const spawnJobs = Object.values(Memory.jobs).filter(
          job => job.type === "spawn"
        ) as SpawnJob[];

        const assignedJobs = spawnJobs.filter(
          job =>
            job.params.memory.type === "ReserveCreep" &&
            job.params.memory.room === roomName
        );
        const requestedCreeps = 1;

        if (
          assignedCreeps.length < requestedCreeps &&
          assignedJobs.length === 0
        ) {
          Log(
            LogSeverity.DEBUG,
            "ControllerDaemon",
            `Number of reserve creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
          );
          Memory.jobs[`ReserveCreep-${roomName}-${Game.time}`] = {
            type: "spawn",
            name: `ReserveCreep-${roomName}-${Game.time}`,
            bodyPartRatio: ReserveCreep.bodyPartRatio,
            maxBodyParts: ReserveCreep.maxBodyParts,
            status: "pending",
            priority: 3,
            params: {
              memory: {
                type: "ReserveCreep",
                room: roomName,
                curTask: "spawning"
              }
            }
          };
          Log(
            LogSeverity.INFORMATIONAL,
            "ControllerDaemon",
            `Reserve creep spawn job created for ${roomName} at ${Game.time}`
          );
        }
      }
    });
  }
}

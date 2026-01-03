import { LinkCreep } from "Creeps/LinkCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class LinkDaemon {
  public constructor() {
    Object.keys(Game.rooms).forEach(roomName => {
      this.discernLinkTypes(roomName);
      this.discernLinkDistances(roomName);
      this.manageStorageLinkCreeps(roomName);
      this.operateLinks(roomName);
    });
  }

  private discernLinkTypes(roomName: string) {
    if (Memory.rooms[roomName].structures) {
      if (Memory.rooms[roomName].structures!.links) {
        Log(LogSeverity.DEBUG, "LinkDaemon", `Links detected in ${roomName}`);
        const roomLinkIds = Object.entries(Memory.rooms[roomName].structures!.links!)
          .filter(([, roomLinkMemory]) => roomLinkMemory.linkType === "unknown")
          .map(([roomLinkId]) => roomLinkId);

        roomLinkIds.forEach(roomLinkId => {
          const roomLink = Game.getObjectById(roomLinkId as Id<StructureLink>);
          if (roomLink) {
            let storageLink = false;
            const roomStorage = roomLink.room.storage;
            if (roomStorage) {
              if (roomLink.pos.inRangeTo(roomStorage.pos, 2) === true) {
                storageLink = true;
              }
            }

            if (storageLink) {
              Memory.rooms[roomName].structures!.links![roomLinkId].linkType =
                "storage";
            } else {
              let sourceLink = false;

              const roomSources = Object.keys(Memory.rooms[roomName].sources!);
              roomSources.forEach(roomSourceId => {
                const roomSource = Game.getObjectById(roomSourceId as Id<Source>);
                if (roomSource) {
                  if (roomLink.pos.inRangeTo(roomSource.pos, 2) === true) {
                    sourceLink = true;
                  }
                }
              });

              if (sourceLink) {
                Memory.rooms[roomName].structures!.links![roomLinkId].linkType =
                  "source";
              } else {
                let controllerLink = false;

                const roomController = roomLink.room.controller;
                if (roomController) {
                  if (roomLink.pos.inRangeTo(roomController.pos, 3)) {
                    controllerLink = true;
                  }
                }

                if (controllerLink) {
                  Memory.rooms[roomName].structures!.links![roomLinkId].linkType =
                    "controller";
                }
              }
            }
          }

          const linkType =
            Memory.rooms[roomName].structures!.links![roomLinkId].linkType;
          if (linkType === "unknown") {
            Log(
              LogSeverity.ERROR,
              "LinkDaemon",
              `Link ${roomLinkId} in ${roomName} has an "unknown" type, and could not be configured!`
            );
          } else {
            Log(
              LogSeverity.DEBUG,
              "LinkDaemon",
              `Link ${roomLinkId} in ${roomName} had an "unknown" type, and has been configured as a ${linkType} link`
            );
          }
        });
      }
    }
  }

  private discernLinkDistances(roomName: string) {
    if (Memory.rooms[roomName].structures) {
      if (Memory.rooms[roomName].structures!.links) {
        const roomLinkIds = Object.keys(Memory.rooms[roomName].structures!.links!);
        roomLinkIds.forEach(roomLinkId => {
          const roomLink = Game.getObjectById(roomLinkId as Id<StructureLink>);
          if (roomLink) {
            const otherRoomLinkIds = roomLinkIds.filter(
              otherRoomLinkId => otherRoomLinkId !== roomLinkId
            );
            otherRoomLinkIds.forEach(otherRoomLinkId => {
              if (
                !Memory.rooms[roomName].structures!.links![roomLinkId].distances[
                  otherRoomLinkId
                ]
              ) {
                const otherRoomLink = Game.getObjectById(
                  otherRoomLinkId as Id<StructureLink>
                );
                if (otherRoomLink) {
                  if (
                    Memory.rooms[roomName].structures!.links![otherRoomLinkId]
                      .linkType !== "unknown"
                  ) {
                    Memory.rooms[roomName].structures!.links![roomLinkId].distances[
                      otherRoomLinkId
                    ] = {
                      distance: roomLink.pos.getRangeTo(otherRoomLink),
                      type: Memory.rooms[roomName].structures!.links![otherRoomLinkId]
                        .linkType as "storage" | "source" | "controller"
                    };
                  }
                }
              }
            });
          }
        });
      }
    }
  }

  private manageStorageLinkCreeps(roomName: string) {
    if (Memory.rooms[roomName].structures) {
      if (Memory.rooms[roomName].structures!.links) {
        const storageLinkIds = Object.entries(Memory.rooms[roomName].structures!.links!)
          .filter(([, linkMemory]) => linkMemory.linkType === "storage")
          .map(([storageLinkKey]) => storageLinkKey)
          .sort((storageLinkKeyA, storageLinkKeyB) =>
            storageLinkKeyA.localeCompare(storageLinkKeyB)
          );

        const storageLinkId = storageLinkIds.pop();

        const controllerLinkId = Object.entries(
          Memory.rooms[roomName].structures!.links!
        )
          .filter(([, linkMemory]) => linkMemory.linkType === "controller")
          .map(([controllerLinkKey]) => controllerLinkKey)
          .pop();

        const storage = Game.rooms[roomName].storage;

        if (storageLinkId && controllerLinkId && storage) {
          const controllerLinkDistance =
            Memory.rooms[roomName].structures!.links![storageLinkId].distances[
              controllerLinkId
            ].distance;
          const requiredBodyPartCount = Math.ceil(
            (800 * (storageLinkIds.length + 1)) / (controllerLinkDistance / 2) / 50
          );

          const maxBodyParts: Partial<Record<BodyPartConstant, number>> = {
            move: requiredBodyPartCount,
            carry: requiredBodyPartCount
          };

          const assignedCreeps = Object.values(Game.creeps).filter(
            creep =>
              creep.memory.room === roomName &&
              creep.memory.assignedLink === storageLinkId
          );
          const spawnJobs = Object.values(Memory.jobs).filter(
            job => job.type === "spawn"
          ) as SpawnJob[];

          const assignedJobs = spawnJobs.filter(
            job =>
              job.params.memory.room === roomName &&
              job.params.memory.assignedLink === storageLinkId
          );
          const requestedCreeps = 1;
          if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
            Log(
              LogSeverity.DEBUG,
              "ResourceDaemon",
              `Number of link creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
            );
            Memory.jobs[`LinkCreep-${roomName}-${Game.time}`] = {
              type: "spawn",
              name: `LinkCreep-${roomName}-${Game.time}`,
              bodyPartRatio: LinkCreep.bodyPartRatio,
              maxBodyParts,
              status: "pending",
              priority: 3,
              params: {
                memory: {
                  type: "LinkCreep",
                  room: roomName,
                  assignedLink: storageLinkId as Id<StructureLink>,
                  curTask: "spawning"
                }
              }
            };
            Log(
              LogSeverity.INFORMATIONAL,
              "ResourceDaemon",
              `Link creep spawn job created in ${roomName} at ${Game.time}`
            );
          }
        }
      }
    }
  }

  private operateLinks(roomName: string) {
    if (Memory.rooms[roomName].structures) {
      if (Memory.rooms[roomName].structures!.links) {
        Log(LogSeverity.DEBUG, "LinkDaemon", ``);
        const roomLinkIds = Object.keys(Memory.rooms[roomName].structures!.links!);
        roomLinkIds.forEach(roomLinkId => {
          const roomLink = Game.getObjectById(roomLinkId as Id<StructureLink>);
          if (roomLink) {
            if (
              roomLink.cooldown === 0 &&
              roomLink.store[RESOURCE_ENERGY] === roomLink.store.getCapacity(RESOURCE_ENERGY)
            ) {
              const roomLinkType =
                Memory.rooms[roomName].structures!.links![roomLinkId].linkType;
              if (roomLinkType === "storage") {
                const controllerLinkId = Object.entries(
                  Memory.rooms[roomName].structures!.links!
                )
                  .filter(([, linkMemory]) => linkMemory.linkType === "controller")
                  .map(([controllerLinkKey]) => controllerLinkKey)
                  .pop();
                const controllerLink = Game.getObjectById(
                  controllerLinkId as Id<StructureLink>
                );
                if (controllerLink) {
                  if (
                    controllerLink.store[RESOURCE_ENERGY] <
                    controllerLink.store.getCapacity(RESOURCE_ENERGY) * 0.125
                  ) {
                    roomLink.transferEnergy(controllerLink);
                  }
                }
              }
            }
          }
        });
      }
    }
  }
}

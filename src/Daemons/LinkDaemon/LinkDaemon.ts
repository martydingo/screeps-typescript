import { LinkCreep } from "Creeps/LinkCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";


export class LinkDaemon {
  @profileClass("LinkDaemon")
  public static run() {
    Object.keys(Game.rooms).forEach(roomName => {
      this.discernLinkTypes(roomName);
      this.discernLinkDistances(roomName);
      this.manageStorageLinkCreeps(roomName);
      this.operateLinks(roomName);
    });
  }

  @profileMethod
private static discernLinkTypes(roomName: string) {
    if (global.store.rooms[roomName].structures) {
      if (global.store.rooms[roomName].structures!.links) {
        Log(LogSeverity.DEBUG, "LinkDaemon", `Links detected in ${roomName}`);
        const roomLinkIds = Object.entries(global.store.rooms[roomName].structures!.links!)
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
              global.store.rooms[roomName].structures!.links![roomLinkId].linkType =
                "storage";
            } else {
              let sourceLink = false;

              const roomSources = Object.keys(global.store.rooms[roomName].sources!);
              roomSources.forEach(roomSourceId => {
                const roomSource = Game.getObjectById(roomSourceId as Id<Source>);
                if (roomSource) {
                  if (roomLink.pos.inRangeTo(roomSource.pos, 2) === true) {
                    sourceLink = true;
                  }
                }
              });

              if (sourceLink) {
                global.store.rooms[roomName].structures!.links![roomLinkId].linkType =
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
                  global.store.rooms[roomName].structures!.links![roomLinkId].linkType =
                    "controller";
                }
              }
            }
          }

          const linkType =
            global.store.rooms[roomName].structures!.links![roomLinkId].linkType;
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

  @profileMethod
private static discernLinkDistances(roomName: string) {
    if (global.store.rooms[roomName].structures) {
      if (global.store.rooms[roomName].structures!.links) {
        const roomLinkIds = Object.keys(global.store.rooms[roomName].structures!.links!);
        roomLinkIds.forEach(roomLinkId => {
          const roomLink = Game.getObjectById(roomLinkId as Id<StructureLink>);
          if (roomLink) {
            const otherRoomLinkIds = roomLinkIds.filter(
              otherRoomLinkId => otherRoomLinkId !== roomLinkId
            );
            otherRoomLinkIds.forEach(otherRoomLinkId => {
              if (
                !global.store.rooms[roomName].structures!.links![roomLinkId].distances[
                  otherRoomLinkId
                ]
              ) {
                const otherRoomLink = Game.getObjectById(
                  otherRoomLinkId as Id<StructureLink>
                );
                if (otherRoomLink) {
                  if (
                    global.store.rooms[roomName].structures!.links![otherRoomLinkId]
                      .linkType !== "unknown"
                  ) {
                    global.store.rooms[roomName].structures!.links![roomLinkId].distances[
                      otherRoomLinkId
                    ] = {
                      distance: roomLink.pos.getRangeTo(otherRoomLink),
                      type: global.store.rooms[roomName].structures!.links![otherRoomLinkId]
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

  @profileMethod
private static manageStorageLinkCreeps(roomName: string) {
    if (global.store.rooms[roomName].structures) {
      if (global.store.rooms[roomName].structures!.links) {
        const storageLinkIds = Object.entries(global.store.rooms[roomName].structures!.links!)
          .filter(([, linkMemory]) => linkMemory.linkType === "storage")
          .map(([storageLinkKey]) => storageLinkKey)
          .sort((storageLinkKeyA, storageLinkKeyB) =>
            storageLinkKeyA.localeCompare(storageLinkKeyB)
          );

        const storageLinkId = storageLinkIds.pop();

        const controllerLinkId = Object.entries(
          global.store.rooms[roomName].structures!.links!
        )
          .filter(([, linkMemory]) => linkMemory.linkType === "controller")
          .map(([controllerLinkKey]) => controllerLinkKey)
          .pop();

        const storage = Game.rooms[roomName].storage;

        if (storageLinkId && controllerLinkId && storage) {
          const controllerLinkDistance =
            global.store.rooms[roomName].structures!.links![storageLinkId].distances[
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
              global.store.creeps[creep.name].room === roomName &&
              global.store.creeps[creep.name].assignedLink === storageLinkId
          );
          const spawnJobs = Object.values(global.store.jobs).filter(
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
            global.store.jobs[`LinkCreep-${roomName}-${Game.time}`] = {
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

  @profileMethod
private static operateLinks(roomName: string) {
    if (global.store.rooms[roomName].structures) {
      if (global.store.rooms[roomName].structures!.links) {
        Log(LogSeverity.DEBUG, "LinkDaemon", ``);
        const roomLinkIds = Object.keys(global.store.rooms[roomName].structures!.links!);
        roomLinkIds.forEach(roomLinkId => {
          const roomLink = Game.getObjectById(roomLinkId as Id<StructureLink>);
          if (roomLink) {
            if (
              roomLink.cooldown === 0 &&
              roomLink.store[RESOURCE_ENERGY] === roomLink.store.getCapacity(RESOURCE_ENERGY)
            ) {
              const roomLinkType =
                global.store.rooms[roomName].structures!.links![roomLinkId].linkType;
              if (roomLinkType === "storage") {
                const controllerLinkId = Object.entries(
                  global.store.rooms[roomName].structures!.links!
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

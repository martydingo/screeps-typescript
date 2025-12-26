import { TransportCreep } from "Creeps/TransportCreep";
import { Log, LogSeverity } from "utils/log";

export class ResourceDaemon {
  public constructor() {
    Object.entries(Memory.rooms).forEach(([roomName, roomMemory]) => {
      const roomResources = roomMemory.resources;
      if (roomResources) {
        if (Object.keys(roomResources).length > 0) {
          const room = Game.rooms[roomName];
          if (room) {
            if (room.storage) {
              const anchorFlags = Object.entries(Game.flags).filter(
                ([flagName, flag]) => flagName.includes("anchor") && flag.pos.roomName === roomName
              );
              if (anchorFlags.length === 0) {
                Log(
                  LogSeverity.DEBUG,
                  "ResourceDaemon",
                  `Storage but no anchor points detected in ${roomName}, assuming the room needs a transport creep`
                );
                const assignedCreeps = Object.values(Game.creeps).filter(
                  creep => creep.memory.room === room.name && creep.memory.origin === "loot"
                );
                const assignedJobs = Object.values(Memory.jobs).filter(
                  job => job.params.memory.room === room.name && job.params.memory.origin === "loot"
                );
                const requestedCreeps = 1;
                if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
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
}

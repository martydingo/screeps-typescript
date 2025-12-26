import { config } from "config";
import { SourceCreep } from "Creeps/SourceCreep";
import { Log, LogSeverity } from "utils/log";

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

      if (config.roomsToMine[Memory.env].includes(roomName)) {
        shouldMine = true;
      }


      if (shouldMine === true) {
        Log(LogSeverity.DEBUG, "SourceDaemon", `Mining sources in ${roomName}`);
        Object.keys(Memory.rooms[roomName].sources!).forEach(sourceId => {
          const assignedCreeps = Object.values(Game.creeps).filter(creep => creep.memory.assignedSource === sourceId);
          const assignedJobs = Object.values(Memory.jobs).filter(job => job.params.memory.assignedSource === sourceId);
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
              priority: 1,
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
}

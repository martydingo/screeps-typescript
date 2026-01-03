import { BuildCreep } from "Creeps/BuildCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
// import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

// )@profileClass()
export class ConstructionDaemon {
  public static run() {
    {
      Object.keys(Memory.rooms).forEach(roomName => {
        if (Object.keys(Memory.rooms[roomName].constructionSites || []).length > 0) {
          Log(
            LogSeverity.DEBUG,
            "ConstructionDaemon",
            `${Object.keys(Memory.rooms[roomName].constructionSites!).length
            } construction sites detected within ${roomName}`
          );
          const spawnJobs = Object.values(Memory.jobs).filter(job => job.type === "spawn") as SpawnJob[];

          const buildCreeps = Object.values(Game.creeps).filter(
            creep => creep.memory.room === roomName && creep.memory.type === "BuildCreep"
          );
          const builderSpawnJobs = spawnJobs.filter(
            job => job.params.memory.room === roomName && job.params.memory.type === "BuildCreep"
          );

          //   console.log(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5 )
          //   console.log(Math.min(Math.ceil(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5), 3));
          const requestedCreeps = Math.min(Math.ceil(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5), 1)
          if (buildCreeps.length < requestedCreeps && builderSpawnJobs.length === 0) {
            Log(
              LogSeverity.DEBUG,
              "ConstructionDaemon",
              `Number of build creeps in $${roomName} (${buildCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
            );
            Memory.jobs[`BuildCreep-${roomName}-${Game.time}`] = {
              type: "spawn",
              name: `BuildCreep-${roomName}-${Game.time}`,
              bodyPartRatio: BuildCreep.bodyPartRatio,
              status: "pending",
              priority: 6,
              params: {
                memory: {
                  type: "BuildCreep",
                  room: roomName,
                  assignedRoom: roomName,
                  curTask: "spawning"
                }
              }
            };
            Log(
              LogSeverity.INFORMATIONAL,
              "ConstructionDaemon",
              `Build creep spawn job created in ${roomName} at ${Game.time}`
            );
          }
        }
      });
    }
  }
}

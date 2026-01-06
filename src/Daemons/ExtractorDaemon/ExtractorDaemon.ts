import { ExtractorCreep } from "Creeps/ExtractorCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { Log, LogSeverity } from "utils/log";
import { Pathfinding } from "utils/Pathfinding";
import { profileClass, profileMethod } from "utils/Profiler";


export class ExtractorDaemon {
  @profileClass("ExtractorDaemon")
  public static run() {
    const extractors = Object.values(Game.structures)
      .filter(structure => structure.structureType === "extractor")
      .map(extractor => extractor) as StructureExtractor[];

    extractors.forEach(extractor => {
      ExtractorDaemon.manageExtractorCreeps(extractor);
    });
  }

  @profileMethod
private static manageExtractorCreeps(extractor: StructureExtractor) {
    const room = extractor.room;

    const assignedCreeps = Object.values(Game.creeps).filter(
      creep => global.store.creeps[creep.name].room === room.name && global.store.creeps[creep.name].assignedExtractor === extractor.id
    );
    const spawnJobs = Object.values(global.store.jobs).filter(job => job.type === "spawn") as SpawnJob[];

    const assignedJobs = spawnJobs.filter(
      job => job.params.memory.room === room.name && job.params.memory.assignedExtractor === extractor.id
    );
    const requestedCreeps = 1;
      if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
        const containerNearExtractor = Pathfinding.lookAround(extractor.pos, "containers", 2) as StructureContainer || null
        if (containerNearExtractor) {
          if (containerNearExtractor.store.getFreeCapacity() > 0) {
            Log(
              LogSeverity.DEBUG,
              "ResourceDaemon",
              `Number of transport creeps in $${extractor.pos.roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
            );
            global.store.jobs[`ExtractorCreep-${extractor.pos.roomName}-${Game.time}`] = {
              type: "spawn",
              name: `ExtractorCreep-${extractor.pos.roomName}-${Game.time}`,
              bodyPartRatio: ExtractorCreep.bodyPartRatio,
              status: "pending",
              priority: 4,
              params: {
                memory: {
                  type: "ExtractorCreep",
                  room: extractor.pos.roomName,
                  assignedExtractor: extractor.id,
                  assignedContainer: containerNearExtractor.id,
                  curTask: "spawning"
                }
              }
            };
            Log(
              LogSeverity.INFORMATIONAL,
              "ResourceDaemon",
              `Transport creep spawn job created in ${extractor.pos.roomName} at ${Game.time}`
            );
          }
        }
      }
  }
}

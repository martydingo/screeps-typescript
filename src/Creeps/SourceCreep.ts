import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";
import { StorageMonitor } from "Monitors/Structure/StorageMonitor";

interface SourceCreepMemory extends CreepMemoryTemplate {
  assignedSource: Id<Source>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<SourceCreepMemory> {}
}


export class SourceCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 2, carry: 1, move: 2 };
  public static maxBodyParts = { work: 6, carry: 1, move: 8 };

  @profileClass("SourceCreep")
  public static run() {


    Object.values(Game.creeps)
      .filter(creep => global.store.creeps[creep.name].type === "SourceCreep")
      .forEach(sourceCreep => {
        if (global.store.creeps[sourceCreep.name].curTask === "spawning" && sourceCreep.spawning === false) {
          global.store.creeps[sourceCreep.name].curTask = "miningSource";
          Log(LogSeverity.DEBUG, "SourceCreep", `${sourceCreep.name} has spawned, task set to "fetchingEnergy"`);

        }
         if(sourceCreep.spawning) return

        if (global.store.creeps[sourceCreep.name].curTask === "miningSource") {
          let shouldMine = false;
          const assignedSource = global.store.creeps[sourceCreep.name].assignedSource;
          if (Game.flags[`source-anchor-${assignedSource as string}`]) {
            const anchorPoint = Game.flags[`source-anchor-${assignedSource as string}`];
            if (sourceCreep.pos.getRangeTo(anchorPoint.pos) > 0) {
              const moveResult = sourceCreep.moveTo(anchorPoint.pos);
              if (moveResult === OK) {
                Log(
                  LogSeverity.DEBUG,
                  "SourceCreep",
                  `${sourceCreep.name} has moved towards anchor ${anchorPoint.name}`
                );
              } else {
                Log(
                  LogSeverity.DEBUG,
                  "SourceCreep",
                  `${sourceCreep.name} has failed to move towards anchor ${anchorPoint.name} with result: ${moveResult}`
                );
              }
            } else {
              shouldMine = true;
            }
          } else {
            shouldMine = true;
          }
          if (shouldMine === true) {
            const mineResult = sourceCreep.mineSource(global.store.creeps[sourceCreep.name].assignedSource!);
            if (mineResult === ERR_INVALID_TARGET) {
              const room = Game.rooms[global.store.creeps[sourceCreep.name].room!]
              if (!room) {
                sourceCreep.moveToUnknownRoom(global.store.creeps[sourceCreep.name].room!);
              }
            }
            if (sourceCreep.store[RESOURCE_ENERGY] > 0) {
              if (sourceCreep.room.storage) {
                const transferResult = sourceCreep.transfer(sourceCreep.room.storage, RESOURCE_ENERGY);
                if (transferResult !== OK) {
                  sourceCreep.drop(RESOURCE_ENERGY);
                  Log(LogSeverity.DEBUG, "SourceCreep", `${sourceCreep.name} has dropped energy`);
                } else {
                  Log(
                    LogSeverity.DEBUG,
                    "SourceCreep",
                    `${sourceCreep.name} deposited energy into storage ${sourceCreep.room.storage.id}`
                  );
                }
              } else {
                sourceCreep.drop(RESOURCE_ENERGY);
                Log(LogSeverity.DEBUG, "SourceCreep", `${sourceCreep.name} has dropped energy`);
              }
            }
          }
        }
      });
  }
}

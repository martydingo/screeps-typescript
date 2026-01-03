import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

type ClaimCreepMemory = CreepMemoryTemplate;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ClaimCreepMemory> {}
}

@profileClass()
export class ClaimCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 0, move: 5, claim: 1 };
  public static maxBodyParts = { move: 5, claim: 1 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "ClaimCreep")
      .forEach(claimCreep => {
        if (claimCreep.memory.curTask === "spawning" && claimCreep.spawning === false) {
          claimCreep.memory.curTask = "movingToRoom";
          Log(LogSeverity.DEBUG, "claimCreep", `${claimCreep.name} has spawned, task set to "movingToRoom".`);
        }

        switch (claimCreep.memory.curTask) {
          case "movingToRoom":
            this.moveToRoom(claimCreep);
            break;
          case "claimingController":
            this.claimController(claimCreep);
            break;
        }
      });
  }
  private moveToRoom(claimCreep: Creep) {
    const moveResult = claimCreep.moveTo(new RoomPosition(25, 25, claimCreep.memory.room!));
    if (moveResult === OK) {
      Log(LogSeverity.DEBUG, "claimCreep", `${claimCreep.name} has moved towards ${claimCreep.memory.room!}`,);
    } else {
      Log(
        LogSeverity.ERROR,
        "claimCreep",
        `${claimCreep.name} has failed to move while moving towards ${claimCreep.memory.room!}: ${moveResult}.`
      );
    }
    if (claimCreep.room.name === claimCreep.memory.room) {
      claimCreep.memory.curTask = "claimingController";
      Log(
        LogSeverity.DEBUG,
        "claimCreep",
        `${claimCreep.name} has moved into ${claimCreep.memory.room}, task set to "claimingController".`
      );
    }
  }

  private claimController(claimCreep: Creep) {
    const room = Game.rooms[claimCreep.memory.room!];
    if (room) {
      const controller = room.controller;
      if (controller) {
        if (!controller.my) {
          const claimResult = claimCreep.claimController(controller);
          if (claimResult === ERR_NOT_IN_RANGE) {
            const moveResult = claimCreep.moveTo(controller);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "claimCreep",
                `${claimCreep.name} is not in range of controller ${controller.id} in ${claimCreep.memory
                  .room!}, and is moving towards the controller.`
              );
            } else {
              Log(
                LogSeverity.DEBUG,
                "claimCreep",
                `${claimCreep.name} is not in range of controller ${controller.id} in ${claimCreep.memory
                  .room!}, and has failed attempting to move towards the controller with the result: ${moveResult}.`
              );
            }
            return moveResult;
          } else {
            if (claimResult === OK) {
              Log(
                LogSeverity.NOTICE,
                "claimCreep",
                `${claimCreep.name} has successfully claimed ${claimCreep.memory.room!}!`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "claimCreep",
                `${claimCreep.name} has failed to claim ${claimCreep.memory.room!} with the error code ${claimResult}.`
              );
            }
          }
          return claimResult;
        } else {
          Log(
            LogSeverity.WARNING,
            "claimCreep",
            `${claimCreep.name} has attempted to claim ${claimCreep.memory.room!}, but we already have claimed it!`
          );
        }
        return ERR_INVALID_TARGET;
      } else {
        return ERR_NOT_FOUND;
      }
    } else {
      claimCreep.memory.curTask = "movingToRoom";
      Log(
        LogSeverity.WARNING,
        "claimCreep",
        `${claimCreep.name} has attempted to claim ${claimCreep.memory.room!}, but needs to move intp ${claimCreep
          .memory.room!}. Setting task to "movingToRoom".`
      );
      return ERR_NOT_IN_RANGE;
    }
  }
}

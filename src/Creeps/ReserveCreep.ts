import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

type ReserveCreepMemory = CreepMemoryTemplate;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ReserveCreepMemory> {}
}


export class ReserveCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 0, move: 7, claim: 2 };
  public static maxBodyParts = { move: 7, claim: 2 };

  @profileClass("ReserveCreep")
  public static run() {


    Object.values(Game.creeps)
      .filter(creep => global.store.creeps[creep.name].type === "ReserveCreep")
      .forEach(reserveCreep => {
        if (
          global.store.creeps[reserveCreep.name].curTask === "spawning" &&
          reserveCreep.spawning === false
        ) {
          global.store.creeps[reserveCreep.name].curTask = "movingToRoom";
          Log(
            LogSeverity.DEBUG,
            "`ReserveCreep",
            `${reserveCreep.name} has spawned, task set to "movingToRoom".`
          );
        }
        if (reserveCreep.spawning) return;

        switch (global.store.creeps[reserveCreep.name].curTask) {
          case "movingToRoom":
            this.moveToRoom(reserveCreep);
            break;
          case "reserveingController":
            this.reserveController(reserveCreep);
            break;
        }
      });
  }
 @profileMethod
  private static moveToRoom(reserveCreep: Creep) {
    const moveResult = reserveCreep.moveTo(
      new RoomPosition(25, 25, global.store.creeps[reserveCreep.name].room!)
    );
    if (moveResult === OK) {
      Log(
        LogSeverity.DEBUG,
        "ReserveCreep",
        `${reserveCreep.name} has moved towards ${global.store.creeps[reserveCreep.name].room!}`
      );
    } else {
      Log(
        LogSeverity.ERROR,
        "ReserveCreep",
        `${reserveCreep.name} has failed to move while moving towards ${global.store
          .creeps[reserveCreep.name].room!}: ${moveResult}.`
      );
    }
    if (reserveCreep.room.name === global.store.creeps[reserveCreep.name].room) {
      global.store.creeps[reserveCreep.name].curTask = "reserveingController";
      Log(
        LogSeverity.DEBUG,
        "ReserveCreep",
        `${reserveCreep.name} has moved into ${global.store.creeps[reserveCreep.name].room!}, task set to "reserveingController".`
      );
    }
  }

 @profileMethod
  private static reserveController(reserveCreep: Creep) {
    const room = Game.rooms[global.store.creeps[reserveCreep.name].room!];
    if (room) {
      const controller = room.controller;
      if (controller) {
        if (!controller.my) {
          const controllerDistance = reserveCreep.pos.getRangeTo(controller);
          if (controllerDistance >= 2) {
            const moveResult = reserveCreep.moveTo(controller);
            if (moveResult === OK) {
              Log(
                LogSeverity.DEBUG,
                "CreepTemplate",
                `${reserveCreep.name} is not in range of controller ${controller.id} in ${controller.pos.roomName}, and has moved closer.`
              );
            } else {
              Log(
                LogSeverity.ERROR,
                "CreepTemplate",
                `${reserveCreep.name} is not in range of controller ${controller.id} in ${controller.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
              );
            }
            if (reserveCreep.pos.getRangeTo(controller) > 1) return moveResult;
          }
          const reserveResult = reserveCreep.reserveController(controller);

          if (reserveResult === OK) {
            if (controller.reservation!.ticksToEnd <= 1)
              Log(
                LogSeverity.NOTICE,
                "ReserveCreep",
                `${reserveCreep.name} has successfully reserved ${global.store.creeps[reserveCreep.name]
                  .room!}!`
              );
          } else {
            Log(
              LogSeverity.ERROR,
              "ReserveCreep",
              `${reserveCreep.name} has failed to reserve ${global.store.creeps[reserveCreep.name]
                .room!} with the error code ${reserveResult}.`
            );
          }

          return reserveResult;
        }
        return ERR_INVALID_TARGET;
      } else {
        return ERR_NOT_FOUND;
      }
    } else {
      global.store.creeps[reserveCreep.name].curTask = "movingToRoom";
      Log(
        LogSeverity.WARNING,
        "ReserveCreep",
        `${reserveCreep.name} has attempted to reserve ${global.store.creeps[reserveCreep.name]
          .room!}, but needs to move intp ${global.store.creeps[reserveCreep.name]
          .room!}. Setting task to "movingToRoom".`
      );
      return ERR_NOT_IN_RANGE;
    }
  }
}

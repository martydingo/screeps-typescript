import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

type ClaimCreepMemory = CreepMemoryTemplate;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<ClaimCreepMemory> {}
}

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
    if (claimCreep.room.name === claimCreep.memory.room) {
      claimCreep.memory.curTask = "claimingController";
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
            return moveResult;
          }
          return claimResult;
        }
        return ERR_INVALID_TARGET;
      } else {
        return ERR_NOT_FOUND;
      }
    } else {
      claimCreep.memory.curTask = "movingToRoom";
      return ERR_NOT_IN_RANGE;
    }
  }
}

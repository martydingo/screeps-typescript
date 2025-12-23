import { ControllerCreep } from "Creeps/ControllerCreep";

export class ControllerDaemon {
  public constructor() {
    Object.keys(Memory.rooms).forEach(roomName => {
      Object.keys(Memory.rooms[roomName].controller!).forEach(controllerId => {
        const assignedCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.assignedController === controllerId
        );
        const assignedJobs = Object.values(Memory.jobs).filter(
          job => job.params.memory.assignedController === controllerId
        );

        if (assignedCreeps.length === 0 && assignedJobs.length === 0) {
          Memory.jobs[`ControllerCreep-${controllerId}-${Game.time}`] = {
            type: "spawn",
            name: `ControllerCreep-${controllerId}-${Game.time}`,
            bodyPartRatio: ControllerCreep.bodyPartRatio,
            status: "pending",
            priority: 3,
            params: {
              memory: {
                type: "ControllerCreep",
                room: roomName,
                assignedController: controllerId as Id<StructureController>,
                curTask: "spawning"
              }
            }
          };
        }
      });
    });
  }
}

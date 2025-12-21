import { BuildCreep } from "Creeps/BuildCreep";

export class ConstructionDaemon {
  public constructor() {
    Object.keys(Memory.rooms).forEach(roomName => {
      if (Object.keys(Memory.rooms[roomName].constructionSites || []).length > 0) {
        const buildCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.room === roomName && creep.memory.type === "BuildCreep"
        );

          console.log(Object.keys(Memory.rooms[roomName].constructionSites!).length % 5)
        if (buildCreeps.length < (Math.min(Object.keys(Memory.rooms[roomName].constructionSites!).length % 5, 5))) {
          Memory.jobs[`BuildCreep-${roomName}-${buildCreeps.length + 1}`] = {
            type: "spawn",
            name: `BuildCreep-${roomName}-${buildCreeps.length + 1}`,
            bodyPartRatio: BuildCreep.bodyPartRatio,
            status: "pending",
            priority: 3,
            params: {
              memory: {
                type: "BuildCreep",
                room: roomName,
                assignedRoom: roomName,
                curTask: "spawning"
              }
            }
          };
        }
      }
    });
  }
}

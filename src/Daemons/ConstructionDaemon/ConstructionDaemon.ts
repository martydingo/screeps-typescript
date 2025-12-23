import { BuildCreep } from "Creeps/BuildCreep";

export class ConstructionDaemon {
  public constructor() {
    Object.keys(Memory.rooms).forEach(roomName => {
      if (Object.keys(Memory.rooms[roomName].constructionSites || []).length > 0) {
        const buildCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.room === roomName && creep.memory.type === "BuildCreep"
        );

        //   console.log(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5 )
        //   console.log(Math.min(Math.ceil(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5), 3));
        if (buildCreeps.length < (Math.min(Math.ceil(Object.keys(Memory.rooms[roomName].constructionSites!).length / 5), 3))) {
          Memory.jobs[`BuildCreep-${roomName}-${Game.time}`] = {
            type: "spawn",
            name: `BuildCreep-${roomName}-${Game.time}`,
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

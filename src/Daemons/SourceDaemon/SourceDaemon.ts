import { SourceCreep } from "Creeps/SourceCreep"

export class SourceDaemon {
    public constructor() {
        Object.keys(Memory.rooms).forEach((roomName) => {
            const roomLevel = Object.values(Memory.rooms[roomName].controller!)[0].level

            Object.keys(Memory.rooms[roomName].sources!).forEach((sourceId) => {
                const assignedCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.assignedSource === sourceId)
                if (assignedCreeps.length === 0) {
                    Memory.jobs[`SourceCreep-${sourceId}-${assignedCreeps.length + 1}`] = {
                      type: "spawn",
                      name: `SourceCreep-${sourceId}-${assignedCreeps.length + 1}`,
                    //   bodyParts: SourceCreep.bodyParts[roomLevel],
                      bodyPartRatio: SourceCreep.bodyPartRatio,
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
                }
            })
        })
    }
}

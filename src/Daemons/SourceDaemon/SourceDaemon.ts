import { config } from "config"
import { SourceCreep } from "Creeps/SourceCreep"

export class SourceDaemon {
    public constructor() {
        Object.keys(Memory.rooms).forEach((roomName) => {
          let shouldMine = false
          if (Game.rooms[roomName]) {
            if (Game.rooms[roomName].controller) {
              const roomControlled = Game.rooms[roomName].controller!.my
              if (roomControlled === true) {
                shouldMine = true;
              }
            }
          }

          if (config.roomsToMine[Memory.env].includes(roomName)) {
            shouldMine = true;
          }

          if (shouldMine === true) {
            Object.keys(Memory.rooms[roomName].sources!).forEach((sourceId) => {
              const assignedCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.assignedSource === sourceId)
              const assignedJobs = Object.values(Memory.jobs).filter((job) => job.params.memory.assignedSource === sourceId)
              if (assignedCreeps.length === 0 && assignedJobs.length === 0) {
                Memory.jobs[`SourceCreep-${sourceId}-${Game.time}`] = {
                  type: "spawn",
                  name: `SourceCreep-${sourceId}-${Game.time}`,
                  //   bodyParts: SourceCreep.bodyParts[roomLevel],
                  bodyPartRatio: SourceCreep.bodyPartRatio,
                  maxBodyParts: SourceCreep.maxBodyParts,
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
          }
        })

    }
}

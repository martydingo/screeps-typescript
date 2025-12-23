import { Ratio, buildBodyFromRatio } from "utils/buildBodyFromRatio";
import { SpawnCreep } from "Creeps/SpawnCreep"

export interface SpawnJob {
  type: "spawn";
  name: string;
  bodyPartRatio: Ratio;
  status: string;
  priority: number;
  params: {
    memory: CreepMemory;
  };
}

export class SpawnDaemon {
    public constructor() {
        this.manageSpawnCreepJobs()
        Object.entries(Memory.jobs).filter(([, job]) => job.type === "spawn" && job.status === "pending").sort(([, spawnJobA], [, spawnJobB]) => spawnJobA.priority - spawnJobB.priority).forEach(([spawnJobId, spawnJob]) => {
            const roomName = spawnJob.params.memory.room as string

            const spawnersInRoom = Object.values(Game.spawns).filter((spawn) => spawn.room.name === roomName)

            if (spawnersInRoom.length > 0) {
                const bodyParts = buildBodyFromRatio({ratio: spawnJob.bodyPartRatio, energyAvailable: Game.rooms[roomName].energyAvailable })
                const spawnCost = this.discernCost(bodyParts)
                if (Memory.rooms[roomName].energy!.amount >= spawnCost && spawnCost <= Memory.rooms[roomName].energy!.capacity) {
                    spawnersInRoom.filter((spawner) => spawner.spawning === null).forEach((spawner) => {
                        const spawnResult = spawner.spawnCreep(bodyParts, spawnJob.name, { memory: spawnJob.params.memory })
                        console.log(`Spawn Result: ${spawnResult}`)

                        if (spawnResult === OK) {
                            delete Memory.jobs[spawnJobId]
                        }
                    })
                }
            }


        })
    }

    private manageSpawnCreepJobs() {
        Object.values(Game.spawns).map((spawn) => spawn.room.name).forEach((roomName => {
            const spawnCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.room === roomName && creep.memory.type === "SpawnCreep")

            if (spawnCreeps.length === 0) {
                Memory.jobs[`SpawnCreep-${roomName}-${Game.time}`] = {
                  type: "spawn",
                  name: `SpawnCreep-${roomName}-${Game.time}`,
                  bodyPartRatio: SpawnCreep.bodyPartRatio,
                  status: "pending",
                  priority: 2,
                  params: {
                    memory: {
                      type: "SpawnCreep",
                      room: roomName,
                      assignedRoom: roomName,
                      curTask: "spawning"
                    }
                  }
                };
            }
        }))
    }

    private discernCost(bodyParts: BodyPartConstant[]) {
        const costMatrix = {
            tough: 10,
            move: 50,
            work: 100,
            carry: 50,
            attack: 80,
            // eslint-disable-next-line camelcase
            ranged_attack: 150,
            heal: 250,
            claim: 600,
        }

        let cost = 0

        bodyParts.forEach((partName) => cost = cost + costMatrix[partName])

        return cost
    }
}

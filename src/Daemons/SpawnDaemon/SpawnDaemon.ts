import { MaxBodyParts, Ratio, buildBodyFromRatio } from "utils/buildBodyFromRatio";
import { SpawnCreep } from "Creeps/SpawnCreep";
import { Log, LogSeverity } from "utils/log";

export interface SpawnJob {
  type: "spawn";
  name: string;
  bodyPartRatio: Ratio;
  maxBodyParts?: MaxBodyParts;
  status: string;
  priority: number;
  params: {
    memory: CreepMemory;
  };
}

declare global {
  interface Memory {
    spawnHeld: { [key: string]: number };
  }
}

export class SpawnDaemon {
  public constructor() {
    this.manageSpawnCreepJobs();

    Log(
      LogSeverity.DEBUG,
      "SpawnDaemon",
      `There are ${
        Object.entries(Memory.jobs).filter(([, job]) => job.type === "spawn" && job.status === "pending").length
      } pending spawn jobs`
    );
    Object.entries(Memory.jobs)
      .filter(([, job]) => job.type === "spawn" && job.status === "pending")
      .sort(([, spawnJobA], [, spawnJobB]) => spawnJobA.priority - spawnJobB.priority)
      .reverse()
      .forEach(([spawnJobId, spawnJob]) => {
        const roomName = spawnJob.params.memory.room as string;

        const spawnersInRoom = Object.values(Game.spawns).filter(spawner => spawner.room.name === roomName);

        let spawn;

        if (spawnersInRoom.length > 0) {
          spawn = spawnersInRoom.filter(spawner => spawner.spawning === null)[0];
          Log(LogSeverity.DEBUG, "SpawnDaemon", `Spawn ${spawn.name} found locally within room ${roomName}`);
        } else {
          spawn = this.findClosestSpawn(roomName);
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Spawn not found within room ${roomName}. ${spawn!.name} will be used instead.`
          );
        }

        if (spawn) {
          const shouldSpawn = this.waitUntilFullCapacity(spawn);
          if (shouldSpawn === true) {
            const bodyParts = buildBodyFromRatio({
              ratio: spawnJob.bodyPartRatio,
              energyAvailable: spawn.room.energyAvailable,
              maxBodyParts: spawnJob.maxBodyParts || {
                tough: 50,
                move: 50,
                work: 50,
                carry: 50,
                attack: 50,
                // eslint-disable-next-line camelcase
                ranged_attack: 50,
                heal: 50,
                claim: 50
              }
            });

            const spawnCost = this.discernCost(bodyParts);
            if (spawn.room.memory.energy!.amount >= spawnCost && spawnCost <= spawn.room.memory.energy!.capacity) {
              const spawnResult = spawn.spawnCreep(bodyParts, spawnJob.name, { memory: spawnJob.params.memory });
              console.log(`Spawn Result: ${spawnResult}`);

              if (spawnResult === OK) {
                delete Memory.jobs[spawnJobId];
              }
            }
          }
        }
      });
  }

  private waitUntilFullCapacity(spawn: StructureSpawn): boolean {
    if (!Memory.spawnHeld) {
      Memory.spawnHeld = {};
      Log(LogSeverity.DEBUG, "SpawnDaemon", `spawnHeld memory not found, spawnHeld memory initialised.`);
    }
    if (spawn.room.energyAvailable === spawn.room.energyCapacityAvailable) {
      delete Memory.spawnHeld[spawn.room.name];
      Log(LogSeverity.DEBUG, "SpawnDaemon", `Spawn energy in room ${spawn.room.name} matches capacity, allowing spawn`);
      return true;
    } else {
      if (!Memory.spawnHeld[spawn.room.name]) {
        Memory.spawnHeld[spawn.room.name] = Game.time;
        Log(
          LogSeverity.DEBUG,
          "SpawnDaemon",
          `Spawn energy in room ${spawn.room.name} is under capacity, delaying spawn until ${Game.time + 300}`
        );
        return false;
      } else {
        if (Game.time - Memory.spawnHeld[spawn.room.name] >= 300) {
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Spawn energy in room ${
              spawn.room.name
            } is still under capacity, but it has been longer then 300 ticks since ${
              Memory.spawnHeld[spawn.pos.roomName]
            } (cur: ${Game.time}), proceeding with spawn`
          );
          delete Memory.spawnHeld[spawn.room.name];
          return true;
        } else {
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Spawn energy in room ${
              spawn.room.name
            } is still under capacity, and it has not yet been longer then 300 ticks since ${
              Memory.spawnHeld[spawn.pos.roomName]
            } (cur: ${Game.time}), delaying spawn`
          );
          return false;
        }
      }
    }
  }

  private findClosestSpawn(roomName: string) {
    const spawnDistanceMatrix = Object.values(Game.spawns)
      .map(spawn => {
        return {
          spawn,
          distance: Object.values(Game.map.findRoute(roomName, spawn.room.name)).length
        };
      })
      .sort((spawnDistanceA, spawnDistanceB) => spawnDistanceA.distance - spawnDistanceB.distance);

    return spawnDistanceMatrix.reverse().pop()?.spawn;
  }

  private manageSpawnCreepJobs() {
    Object.values(Game.spawns)
      .map(spawn => spawn.room.name)
      .forEach(roomName => {
        const assignedCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.room === roomName && creep.memory.type === "SpawnCreep"
        );
        const assignedJobs = Object.values(Memory.jobs).filter(
          job => job.params.memory.room === roomName && job.params.memory.type === "SpawnCreep"
        );

        const requestedCreeps = 1;
        if (assignedCreeps.length < requestedCreeps && assignedJobs.length === 0) {
          Log(
            LogSeverity.DEBUG,
            "SpawnDaemon",
            `Number of spawn creeps in $${roomName} (${assignedCreeps.length}) is under the number requested (${requestedCreeps}), processing spawn job`
          );
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
          Log(LogSeverity.INFORMATIONAL, "SpawnDaemon", `Spawn creep spawn job created in ${roomName} at ${Game.time}`);
        }
      });
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
      claim: 600
    };

    let cost = 0;

    bodyParts.forEach(partName => (cost = cost + costMatrix[partName]));

    return cost;
  }
}

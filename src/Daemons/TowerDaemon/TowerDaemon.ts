import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class TowerDaemon {
  public static run() {
    Object.values(Memory.rooms).forEach(roomMemory => {
      if (roomMemory.structures) {
        if (roomMemory.structures.towers) {
          const towers = Object.keys(roomMemory.structures.towers)
            .map(towerId => Game.getObjectById(towerId as Id<StructureTower>))
            .filter(tower => tower !== null);
          towers.forEach((tower, towerIndex) => this.cycleTowers(tower!, towerIndex));
        }
      }
    });
  }

  @profileMethod
  private static cycleTowers(tower: StructureTower, towerIndex: number) {
    // console.log(
    //   `Tower cycleTowers Start - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
    Log(
      LogSeverity.DEBUG,
      "TowerDaemon",
      `Cycling tower ${tower.id} in ${tower.pos.roomName}`
    );
    const attackCreepResult = this.attackCreeps(tower);
    Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} attack routine finished.`);
    if (attackCreepResult !== OK) {
      const healCreepResult = this.healCreeps(tower);
      Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} heal routine finished.`);
      if (healCreepResult !== OK) {
        const repairStructureResult = this.repairStructures(tower, towerIndex);
        Log(
          LogSeverity.DEBUG,
          "TowerDaemon",
          `Tower ${tower.id} repair routine finished.`
        );
      }
    }
    // console.log(
    //   `Tower cycleTowers End - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
  }

  @profileMethod
  private static healCreeps(tower: StructureTower) {
    // console.log(
    //   `Tower healCreeps Start - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );

    const creepsToHeal = Object.values(Game.creeps).filter(
      creep => creep.room.name === tower.room.name && creep.hits < creep.hitsMax
    );
    const curTarget = creepsToHeal[0];
    if (curTarget) {
      if (tower.store[RESOURCE_ENERGY] >= 10) {
        Log(
          LogSeverity.DEBUG,
          "TowerDaemon",
          `Tower ${tower.id} is healing ${curTarget.name} (${curTarget.owner.username}).`
        );
        return tower.heal(curTarget);
      } else {
        Log(
          LogSeverity.EMERGENCY,
          "TowerDaemon",
          `Tower ${tower.id} is out of energy, and cannot heal ${curTarget.name} (${curTarget.owner.username}) in ${tower.pos.roomName}!`
        );
        return ERR_NOT_ENOUGH_ENERGY
      }
      // console.log(
      //   `Tower healCreeps End - ${tower.pos.roomName} - ${
      //     tower.id
      //   }: ${Game.cpu.getUsed()}`
      // );
    } else {
      return ERR_INVALID_TARGET;
    }
  }
  @profileMethod
  private static attackCreeps(tower: StructureTower) {
    // console.log(
    //   `Tower attackCreeps Start - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
    if (Memory.rooms[tower.room.name].hostiles) {
      const hostileCreeps = Object.keys(tower.room.memory.hostiles!).map(creepId =>
        Game.getObjectById(creepId as Id<Creep>)
      );
      // .filter(creep => creep !== null);

      const curTarget = hostileCreeps[0];

      if (curTarget) {
        if (tower.store[RESOURCE_ENERGY] >= 10) {
          return tower.attack(curTarget);
        } else {
          Log(
            LogSeverity.EMERGENCY,
            "TowerDaemon",
            `Tower ${tower.id} is out of energy, and cannot attack ${curTarget.name} (${curTarget.owner.username}) in ${tower.pos.roomName}!`
          );
          return ERR_NOT_ENOUGH_ENERGY
        }
        // console.log(
        //   `Tower attackCreeps End - ${tower.pos.roomName} - ${
        //     tower.id
        //   }: ${Game.cpu.getUsed()}`
        // );
      } else {
        return ERR_INVALID_TARGET;
      }
    } else {
      return ERR_INVALID_TARGET;
    }
    // console.log(
    //   `Tower attackCreeps End - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
  }
  @profileMethod
  private static repairStructures(tower: StructureTower, towerIndex: number) {
    // console.log(
    //   `Tower repairTarget Start - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
    let repairTarget: StructureRoad | StructureContainer | undefined | null;
    if (tower.room.memory.structures?.containers) {
      const containersInMemory = Object.keys(tower.room.memory.structures.containers)
        .map(containerId => Game.getObjectById(containerId as Id<StructureContainer>))
        .filter(container => container !== null);

      const containers = containersInMemory
        .sort(
          (containerA, containerB) =>
            containerA!.hits / containerA!.hitsMax -
            containerB!.hits / containerB!.hitsMax
        )
        .filter(container => container!.hits < container!.hitsMax);

      if (containers.length >= 1) {
        if (containers.length > 1) {
          const repairCandidate = containers[towerIndex - 1];
          if (repairCandidate) {
            repairTarget = repairCandidate;
          } else {
            repairTarget = containers[0];
          }
        } else {
          repairTarget = containers[0];
        }
      }
    }
    if (!repairTarget) {
      if (tower.room.memory.structures?.roads) {
        const roads = Object.keys(tower.room.memory.structures.roads)
          .map(roadId => Game.getObjectById(roadId as Id<StructureRoad>))
          .filter(road => road !== null) as StructureRoad[];

        const decayedRoads = roads.filter(road => road.hits < road.hitsMax);

        const sortedDecayedRoads = decayedRoads.sort(
          (roadA, roadB) => roadA.hits / roadA.hitsMax - roadB.hits / roadB.hitsMax
        );

        if (sortedDecayedRoads.length >= 1) {
          if (sortedDecayedRoads.length > 1) {
            const repairCandidate = sortedDecayedRoads[towerIndex];
            if (repairCandidate) {
              repairTarget = repairCandidate;
            } else {
              repairTarget = sortedDecayedRoads[0];
            }
          } else {
            repairTarget = sortedDecayedRoads[0];
          }
        }
      }
    }

    if (repairTarget) {
      if (tower.store[RESOURCE_ENERGY] >= 10) {
        Log(
          LogSeverity.NOTICE,
          "TowerDaemon",
          `Tower ${tower.id} is repairing ${repairTarget.structureType} ${repairTarget.id} in ${repairTarget.pos.roomName}`
        );
        // console.log(
        //   `Tower repairTarget End - ${tower.pos.roomName} - ${
        //     tower.id
        //   }: ${Game.cpu.getUsed()}`
        // );
        const repairResult = tower.repair(repairTarget);
        return repairResult;
      }
    }
    // console.log(
    //   `Tower repairTarget End - ${tower.pos.roomName} - ${
    //     tower.id
    //   }: ${Game.cpu.getUsed()}`
    // );
    return ERR_INVALID_TARGET;
  }
}

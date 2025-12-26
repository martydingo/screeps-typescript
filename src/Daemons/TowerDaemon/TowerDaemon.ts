import { Log, LogSeverity } from "utils/log";

export class TowerDaemon {
  public constructor() {
    Object.values(Memory.rooms).forEach(roomMemory => {
      if (roomMemory.structures) {
        if (roomMemory.structures.towers) {
          const towers = Object.keys(roomMemory.structures.towers)
            .map(towerId => Game.getObjectById(towerId as Id<StructureTower>))
            .filter(tower => tower !== null);
          towers.forEach(tower => this.cycleTowers(tower!));
        }
      }
    });
  }

  private cycleTowers(tower: StructureTower) {
    Log(LogSeverity.DEBUG, "TowerDaemon", `Cycling tower ${tower.id} in ${tower.pos.roomName}`);
    const attackCreepResult = this.attackCreeps(tower);
    Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} attack routine finished.`);
    if (attackCreepResult !== OK) {
      const healCreepResult = this.healCreeps(tower);
      Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} heal routine finished.`);
      if (healCreepResult !== OK) {
        const repairStructureResult = this.repairStructures(tower);
        Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} repair routine finished.`);
      }
    }
  }

  private healCreeps(tower: StructureTower) {
    const creepsToHeal = Object.values(Game.creeps).filter(
      creep => creep.room.name === tower.room.name && creep.hits < creep.hitsMax
    );
    const curTarget = creepsToHeal[0];
    if (curTarget) {
      Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} is healing ${curTarget.name} (${curTarget.owner.username}).`);
    }

    return tower.heal(curTarget);
  }
  private attackCreeps(tower: StructureTower) {
    if (Memory.rooms[tower.room.name].hostiles) {
      const hostileCreeps = Object.keys(tower.room.memory.hostiles!).map(creepId =>
        Game.getObjectById(creepId as Id<Creep>)
      );
      // .filter(creep => creep !== null);

      const curTarget = hostileCreeps[0];

      if (curTarget) {
        Log(
          LogSeverity.DEBUG,
          "TowerDaemon",
          `Tower ${tower.id} is attacking ${curTarget.name} (${curTarget.owner.username}).`
        );
      }

      return tower.attack(curTarget!);
    }
    return ERR_INVALID_TARGET;
  }
  private repairStructures(tower: StructureTower) {
    if (tower.room.memory.structures?.roads) {
      const roads = Object.keys(tower.room.memory.structures.roads)
        .map(roadId => Game.getObjectById(roadId as Id<StructureRoad>))
        .filter(road => road !== null)
        .sort((roadA, roadB) => roadA!.hits - roadB!.hits);

      if (roads.length > 0) {
        Log(LogSeverity.DEBUG, "TowerDaemon", `Tower ${tower.id} is repairing road ${roads[0]!.id} in ${roads[0]!.pos.roomName}`);
        return tower.repair(roads[0]!);

      }
    }

    return ERR_INVALID_TARGET;
  }
}

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
    this.healCreeps(tower);
    this.attackCreeps(tower);
    this.repairStructures(tower);
  }

  private healCreeps(tower: StructureTower) {
    const creepsToHeal = Object.values(Game.creeps).filter(
      creep => creep.room.name === tower.room.name && creep.hits < creep.hitsMax
    );
    const curTarget = creepsToHeal[Game.time % 4];

    tower.heal(curTarget);
  }
  private attackCreeps(tower: StructureTower) {
    if (Memory.rooms[tower.room.name].hostiles) {
      const hostileCreeps = Object.keys(Memory.rooms[tower.room.name].hostiles!)
        .map(towerId => Game.getObjectById(towerId as Id<Creep>))
        .filter(creep => creep !== null);

      const curTarget = hostileCreeps[Game.time % 4];
      tower.attack(curTarget!);
    }
  }
  private repairStructures(tower: StructureTower) {
    if (tower.room.memory.structures?.roads) {
      const roads = Object.keys(tower.room.memory.structures.roads)
        .map(roadId => Game.getObjectById(roadId as Id<StructureRoad>))
        .filter(road => road !== null)
          .sort((roadA, roadB) => roadA!.hits - roadB!.hits);

        if (roads.length > 0) {
            tower.repair(roads[0]!)
        }
    }


  }
}

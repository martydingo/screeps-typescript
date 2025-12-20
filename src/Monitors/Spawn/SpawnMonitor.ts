interface SpawnMemory {
  energy: {
    amount: number;
    capacity: number;
  }
    room: string;
}

export class SpawnMonitor {
  public constructor() {

    if (!Memory.spawns) {
      Memory.spawns = {};
    }

      Object.values(Game.spawns).forEach((spawn) => {
          const payload: SpawnMemory = {
              energy: {
                  amount: spawn.store[RESOURCE_ENERGY],
                  capacity: spawn.store.getCapacity(RESOURCE_ENERGY)
                },
                room: spawn.room.name
            };

            Memory.spawns[spawn.name] = payload;
        })
  }
}

import { profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface TransportCreepMemory extends CreepMemoryTemplate {
  origin: Id<StructureStorage>;
  destination: Id<StructureStorage>;
  resourceType: ResourceConstant;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<TransportCreepMemory> {}
}

@profileClass()
export class TransportCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  public constructor() {
    super();

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "TransportCreep")
      .forEach(transportCreep => {
        if (transportCreep.memory.curTask === "spawning" && transportCreep.spawning === false) {
          transportCreep.memory.curTask = "fetchingResource";
          Log(
            LogSeverity.DEBUG,
            "TransportCreep",
            `${transportCreep.name} has spawned, task set to "fetchingResource"`
          );
        }

        if (transportCreep.memory.curTask === "fetchingResource") {
          if (transportCreep.store.getUsedCapacity() >= transportCreep.store.getCapacity()) {
            transportCreep.memory.curTask = "depositingResource";
            Log(
              LogSeverity.DEBUG,
              "TransportCreep",
              `${transportCreep.name}'s store is full, task set to "depositingResource"`
            );
          }
        } else {
          if (transportCreep.store.getUsedCapacity() === 0) {
            transportCreep.memory.curTask = "fetchingResource";
            Log(
              LogSeverity.DEBUG,
              "TransportCreep",
              `${transportCreep.name}'s store is empty, task set to "fetchingResource"`
            );
          }
        }

        if(transportCreep.spawning) return

        switch (transportCreep.memory.curTask) {
          case "fetchingResource":
            if (transportCreep.memory.origin === "loot") {
              Log(
                LogSeverity.DEBUG,
                "TransportCreep",
                `${transportCreep.name}'s origin is set to "loot", looting resources in ${transportCreep.memory.room!}`
              );
              this.lootEnergyInRoom(transportCreep);
            } else {
              this.fetchResource(transportCreep)
            }
            break;
          case "depositingResource":
            this.depositResource(transportCreep);
        }
      });
  }

  private lootEnergyInRoom(transportCreep: Creep) {
    const assignedRoom = transportCreep.memory.room
    if (assignedRoom) {
      if (transportCreep.pos.roomName === assignedRoom) {
        const lootTombstoneResult =
          transportCreep.lootResourceFromTombstone(RESOURCE_ENERGY);
        if (lootTombstoneResult !== OK) {
          const lootDroppedEnergyResult = transportCreep.fetchDroppedEnergy();
        }
      } else {
        transportCreep.moveToUnknownRoom(assignedRoom)
      }
    }
  }
  private fetchResource(transportCreep: Creep) {
    const origin = Game.getObjectById(transportCreep.memory.origin as Id<StructureStorage>)
    if (origin) {
      transportCreep.fetchResourceFromStructure(origin, transportCreep.memory.resourceType!)
    }
  }

  private depositResource(transportCreep: Creep) {
    const storage = Game.getObjectById(transportCreep.memory.destination as Id<StructureStorage>);
    if (storage) {
        const depositResult = transportCreep.transfer(storage, transportCreep.memory.resourceType as ResourceConstant);
        if (depositResult === ERR_NOT_IN_RANGE) {
          const moveResult = transportCreep.moveTo(storage);
          if (moveResult === OK) {
            Log(
              LogSeverity.DEBUG,
              "SpawnCreep",
              `${transportCreep.name} is not in range of storage ${storage.id} in ${storage.pos.roomName}, and has moved closer.`
            );
          } else {
            Log(
              LogSeverity.ERROR,
              "SpawnCreep",
              `${transportCreep.name} is not in range of storage ${storage.id} in ${storage.pos.roomName}, and has failed to moved closer with a result of ${moveResult}.`
            );
          }
        } else if (depositResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "SpawnCreep",
            `${transportCreep.name} has deposited resource ${transportCreep.memory.resourceType!} into storage ${storage.id} in ${storage.pos.roomName}`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "SpawnCreep",
            `${transportCreep.name} has failed to deposit resource ${transportCreep.memory.resourceType!} into storage ${storage.id} in ${storage.pos.roomName} with result: ${depositResult}`
          );
        }
    }
  }
}

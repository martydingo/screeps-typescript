import { ExtensionMonitor, ExtensionMonitorMemory } from "./ExtensionMonitor";
import { RoadMonitor, RoadMonitorMemory } from "./RoadMonitor";
import { RuinMonitor, RuinMonitorMemory } from "./RuinMonitor";
import { TowerMonitor, TowerMonitorMemory } from "./TowerMonitor";

interface StructureMonitorMemory {
  extensions: ExtensionMonitorMemory;
  towers: TowerMonitorMemory;
  roads: RoadMonitorMemory;
  ruins: RuinMonitorMemory;
}

declare global {
  interface RoomMemory {
    structures?: Partial<StructureMonitorMemory>;
  }
}

export class StructureMonitor {
  public constructor() {
    Object.entries(Memory.rooms).forEach(([roomName, roomMemory]) => {
      if (roomMemory.structures) {
        Object.entries(roomMemory.structures).forEach(([structureType, structureMemory]) => {
          Object.keys(structureMemory).forEach((structureId) => {
            if (Game.getObjectById(structureId as Id<Structure>) === null) {
              delete structureMemory[structureId]
            }
          })
        })
      }
    })
    Object.values(Game.structures).forEach(structure => {
      if (structure.room.controller?.my) {
        if (!structure.room.memory.structures) {
          structure.room.memory.structures = {};
        }
        switch (structure.structureType) {
          case "extension":
            new ExtensionMonitor(structure as StructureExtension);
            break;
          case "tower":
            new TowerMonitor(structure as StructureTower);
            break;
        }
      }
    });

    Object.values(Game.rooms).forEach(room => {
      if (room) {
        if (room.controller?.my) {
          room.find(FIND_STRUCTURES).forEach(structure => {
            switch (structure.structureType) {
              case "road":
                new RoadMonitor(structure);
                break;
            }
          });
        }
      }
    });
    Object.values(Game.rooms).forEach(room => {
      if (room) {
        if (room.controller?.my) {
          room.find(FIND_RUINS).forEach(structure => new RuinMonitor(structure));
        }
      }
    });
  }
}

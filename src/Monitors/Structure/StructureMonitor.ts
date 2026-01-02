import { Log, LogSeverity } from "utils/log";
import { ExtensionMonitor, ExtensionMonitorMemory } from "./ExtensionMonitor";
import { RoadMonitor, RoadMonitorMemory } from "./RoadMonitor";
import { RuinMonitor, RuinMonitorMemory } from "./RuinMonitor";
import { StorageMonitor, StorageMonitorMemory } from "./StorageMonitor";
import { TowerMonitor, TowerMonitorMemory } from "./TowerMonitor";
import { LinkMonitor, LinkMonitorMemory } from "./LinkMonitor";
import { ContainerMonitor, ContainerMonitorMemory } from "./ContainerMonitor";
import { LabMonitor, LabMonitorMemory } from "./LabMonitor";
import { TerminalMonitor, TerminalMonitorMemory } from "./TerminalMonitor";
import { ExtractorMonitor, ExtractorMonitorMemory } from "./ExtractorMonitor";
import { WallMonitor, WallMonitorMemory } from "./WallMonitor";
import { RampartMonitor, RampartMonitorMemory } from "./RampartMonitor";

interface StructureMonitorMemory {
  extensions: ExtensionMonitorMemory;
  towers: TowerMonitorMemory;
  roads: RoadMonitorMemory;
  ruins: RuinMonitorMemory;
  storage: StorageMonitorMemory;
  links: LinkMonitorMemory;
  containers: ContainerMonitorMemory;
  labs: LabMonitorMemory;
  terminal: TerminalMonitorMemory;
  extractor: ExtractorMonitorMemory;
  walls: WallMonitorMemory;
  ramparts: RampartMonitorMemory;
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
        Object.entries(roomMemory.structures).forEach(
          ([structureType, structureMemory]) => {
            Object.keys(structureMemory).forEach(structureId => {
              if (Game.getObjectById(structureId as Id<Structure>) === null) {
                delete structureMemory[structureId];
                Log(
                  LogSeverity.DEBUG,
                  "StructureMonitor",
                  `Structure ${structureId} with type ${structureType} not found, deleting old structure memory`
                );
              }
            });
          }
        );
      }
    });

    Object.values(Game.structures).forEach(structure => {
      if (structure.room.controller?.my) {
        if (!structure.room.memory.structures) {
          structure.room.memory.structures = {};
          Log(
            LogSeverity.DEBUG,
            "StructureMonitor",
            `structure monitor memory not found, structure monitor memory initialised.`
          );
        }
        switch (structure.structureType) {
          case "extension":
            new ExtensionMonitor(structure as StructureExtension);
            break;
          case "tower":
            new TowerMonitor(structure as StructureTower);
            break;
          case "storage":
            new StorageMonitor(structure as StructureStorage);
            break;
          case "link":
            new LinkMonitor(structure as StructureLink);
            break;
          case "lab":
            new LabMonitor(structure as StructureLab);
            break;
          case "terminal":
            new TerminalMonitor(structure as StructureTerminal);
            break;
          case "extractor":
            new ExtractorMonitor(structure as StructureExtractor);
            break;
          case "controller":
            break;
          case "spawn":
            break;
          default:
            Log(
              LogSeverity.WARNING,
              "StructureMonitor",
              `Structure ${structure.id} with type ${structure.structureType} in Game.structures not monitored`
            );
            break;
        }
      }
    });
    Log(
      LogSeverity.DEBUG,
      "StructureMonitor",
      `${
        Object.keys(Game.structures).length
      } structures within Game.structures processed`
    );

    Object.values(Game.rooms).forEach(room => {
      if (room) {
        if (room.controller?.my) {
          const roomStructures = room.find(FIND_STRUCTURES);
          roomStructures.forEach(structure => {
            switch (structure.structureType) {
              case "road":
                new RoadMonitor(structure);
                break;
              case "container":
                new ContainerMonitor(structure);
                break;
              case "constructedWall":
                new WallMonitor(structure);
                break;
              case "rampart":
                new RampartMonitor(structure);
                break;
              case "extension":
                break;
              case "tower":
                break;
              case "storage":
                break;
              case "controller":
                break;
              case "spawn":
                break;
              case "lab":
                break;
              case "link":
                break;
              case "extractor":
                break;
              case "terminal":
                break;

              default:
                Log(
                  LogSeverity.WARNING,
                  "StructureMonitor",
                  `Structure ${structure.id} with type ${structure.structureType} in Game.rooms[${room.name}].find not monitored`
                );
                break;
            }
          });
          Log(
            LogSeverity.DEBUG,
            "StructureMonitor",
            `${roomStructures.length} structures within Game.rooms[${room.name}].find processed`
          );
        }
      }
    });
    Object.values(Game.rooms).forEach(room => {
      if (room) {
        if (room.controller?.my) {
          room.find(FIND_RUINS).forEach(structure => new RuinMonitor(structure));
        }
      }
      Log(
        LogSeverity.DEBUG,
        "StructureMonitor",
        `Ruins within Game.rooms[${room.name}].find processed`
      );
    });
  }
}

// import { profileClass, profileMethod } from "utils/Profiler";
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
import { config } from "config";

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

// @profileClass()
export class StructureMonitor {
  public static run() {
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
    // console.log(`Game.structures poll start: ${Game.cpu.getUsed()}`);
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
            ExtensionMonitor.run(structure as StructureExtension);
            break;
          case "tower":
            TowerMonitor.run(structure as StructureTower);
            break;
          case "storage":
            StorageMonitor.run(structure as StructureStorage);
            break;
          case "link":
            LinkMonitor.run(structure as StructureLink);
            break;
          case "lab":
            LabMonitor.run(structure as StructureLab);
            break;
          case "terminal":
            TerminalMonitor.run(structure as StructureTerminal);
            break;
          case "extractor":
            ExtractorMonitor.run(structure as StructureExtractor);
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
    // console.log(`Game.structures poll end: ${Game.cpu.getUsed()}`);
    Log(
      LogSeverity.DEBUG,
      "StructureMonitor",
      `${
        Object.keys(Game.structures).length
      } structures within Game.structures processed`
    );

    // console.log(`room.find poll start: ${Game.cpu.getUsed()}`);
    // const interval = config[Memory.env].lowCpuMode === true && 4 || 1
    const interval = 10
    if (Game.time % interval === 0) {
      Object.values(Game.rooms).forEach(room => {
        if (room) {
          if (room.controller?.my) {
            const roomStructures = room.find(FIND_STRUCTURES);
            roomStructures.forEach(structure => {
              switch (structure.structureType) {
                case "road":
                  RoadMonitor.run(structure);
                  break;
                case "container":
                  ContainerMonitor.run(structure);
                  break;
                case "constructedWall":
                  WallMonitor.run(structure);
                  break;
                case "rampart":
                  RampartMonitor.run(structure);
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
    } else {
      Log(
        LogSeverity.INFORMATIONAL,
        "StructureMonitor",
        `find-type room monitoring postponed until ${Game.time + (interval - (Game.time % interval))} (${interval - (Game.time % interval)} ticks)`
      );
    }
    // console.log(`room.find poll end: ${Game.cpu.getUsed()}`);
    // console.log(`ruin find poll start: ${Game.cpu.getUsed()}`);
    Object.values(Game.rooms).forEach(room => {
      if (room) {
        if (room.controller?.my) {
          room.find(FIND_RUINS).forEach(structure => RuinMonitor.run(structure));
        }
      }
      Log(
        LogSeverity.DEBUG,
        "StructureMonitor",
        `Ruins within Game.rooms[${room.name}].find processed`
      );
    });
    // console.log(`ruin find poll end: ${Game.cpu.getUsed()}`);
  }
}

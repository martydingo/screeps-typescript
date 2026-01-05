import { BuildCreep } from "Creeps/BuildCreep";
import { ClaimCreep } from "Creeps/ClaimCreep";
import { ControllerCreep } from "Creeps/ControllerCreep";
import { ExtractorCreep } from "Creeps/ExtractorCreep";
import { LabCreep } from "Creeps/LabCreep";
import { LinkCreep } from "Creeps/LinkCreep";
import { ReserveCreep } from "Creeps/ReserveCreep";
import { SourceCreep } from "Creeps/SourceCreep";
import { SpawnCreep } from "Creeps/SpawnCreep";
import { TransportCreep } from "Creeps/TransportCreep";
import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

@profileClass()
export class CreepDaemon {
  public static run() {
    // console.log(`SourceCreep - Start: ${Game.cpu.getUsed()}`);
    SourceCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Source creep daemon initalised`);
    // console.log(`SourceCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`SpawnCreep - Start: ${Game.cpu.getUsed()}`);
    SpawnCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Spawn creep daemon initalised`);
    // console.log(`SpawnCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`ControllerCreep - Start: ${Game.cpu.getUsed()}`);
    ControllerCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Controller creep daemon initalised`);
    // console.log(`ControllerCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`BuildCreep - Start: ${Game.cpu.getUsed()}`);
    BuildCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Build creep daemon initalised`);
    // console.log(`BuildCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`ClaimCreep - Start: ${Game.cpu.getUsed()}`);
    ClaimCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Claim creep daemon initalised`);
    // console.log(`ClaimCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`ReserveCreep - Start: ${Game.cpu.getUsed()}`);
    ReserveCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Claim creep daemon initalised`);
    // console.log(`ReserveCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`TransportCreep - Start: ${Game.cpu.getUsed()}`);
    TransportCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Transport creep daemon initalised`);
    // console.log(`TransportCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`LinkCreep - Start: ${Game.cpu.getUsed()}`);
    LinkCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Link creep daemon initalised`);
    // console.log(`LinkCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`LabCreep - Start: ${Game.cpu.getUsed()}`);
    LabCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Lab creep daemon initalised`);
    // console.log(`LabCreep - End: ${Game.cpu.getUsed()}`);
    // console.log(`ExtractorCreep - Start: ${Game.cpu.getUsed()}`);
    ExtractorCreep.run();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Extractor creep daemon initalised`);
    // console.log(`ExtractorCreep - End: ${Game.cpu.getUsed()}`);
  }
}

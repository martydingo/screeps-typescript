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
import { Log, LogSeverity } from "utils/log";

export class CreepDaemon {
  public constructor() {
    new SourceCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Source creep daemon initalised`);
    new SpawnCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Spawn creep daemon initalised`);
    new ControllerCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Controller creep daemon initalised`);
    new BuildCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Build creep daemon initalised`);
    new ClaimCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Claim creep daemon initalised`);
    new ReserveCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Claim creep daemon initalised`);
    new TransportCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Transport creep daemon initalised`);
    new LinkCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Link creep daemon initalised`);
    new LabCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Lab creep daemon initalised`);
    new ExtractorCreep();
    Log(LogSeverity.DEBUG, "CreepDaemon", `Extractor creep daemon initalised`);

  }
}

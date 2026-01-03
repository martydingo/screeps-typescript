import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { ConstructionDaemon } from "./ConstructionDaemon/ConstructionDaemon";
import { ControllerDaemon } from "./ControllerDaemon/ControllerDaemon";
import { CreepDaemon } from "./CreepDaemon/CreepDaemon";
import { ResourceDaemon } from "./ResourceDaemon/ResourceDaemon";
import { SourceDaemon } from "./SourceDaemon/SourceDaemon";
import { SpawnDaemon, SpawnJob } from "./SpawnDaemon/SpawnDaemon";
import { TowerDaemon } from "./TowerDaemon/TowerDaemon";
import { LinkDaemon } from "./LinkDaemon/LinkDaemon";
import { LabDaemon, LabJob } from "./LabDaemon/LabDaemon";
import { ExtractorDaemon } from "./ExtractorDaemon/ExtractorDaemon";
import { TerminalDaemon } from "./TerminalDaemon/TerminalDaemon";

declare global {
  interface Memory {
    jobs: { [key: string]: SpawnJob | LabJob };
  }
}

@profileClass()
export class Daemons {
  public constructor() {
    if (!Memory.jobs) {
      Memory.jobs = {};
      Log(
        LogSeverity.DEBUG,
        "Daemons",
        `jobs memory not found, job memory initialised.`
      );
    }
    // console.log(`TowerDaemon - Start: ${Game.cpu.getUsed()}`);
    new TowerDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Tower daemon initialized.`);
    // console.log(`TowerDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`SourceDaemon - Start: ${Game.cpu.getUsed()}`);
    new SourceDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Source daemon initialized.`);
    // console.log(`SourceDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`ControllerDaemon - Start: ${Game.cpu.getUsed()}`);
    new ControllerDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Controller daemon initialized.`);
    // console.log(`ControllerDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`SpawnDaemon - Start: ${Game.cpu.getUsed()}`);
    new SpawnDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Spawn daemon initialized.`);
    // console.log(`SpawnDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`ResourceDaemon - Start: ${Game.cpu.getUsed()}`);
    new ResourceDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Resource daemon initialized.`);
    // console.log(`ResourceDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`ConstructionDaemon - Start: ${Game.cpu.getUsed()}`);
    new ConstructionDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Construction daemon initialized.`);
    // console.log(`ConstructionDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`LinkDaemon - Start: ${Game.cpu.getUsed()}`);
    new LinkDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Link daemon initialized.`);
    // console.log(`LinkDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`ExtractorDaemon - Start: ${Game.cpu.getUsed()}`);
    new ExtractorDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Extractor daemon initialized.`);
    // console.log(`ExtractorDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`LabDaemon - Start: ${Game.cpu.getUsed()}`);
    new LabDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Lab daemon initialized.`);
    // console.log(`LabDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`TerminalDaemon - Start: ${Game.cpu.getUsed()}`);
    // new TerminalDaemon();
    // Log(LogSeverity.DEBUG, "Daemons", `Terminal daemon initialized.`);
    // console.log(`TerminalDaemon - End: ${Game.cpu.getUsed()}`);
    // console.log(`CreepDaemon - Start: ${Game.cpu.getUsed()}`);
    new CreepDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Creep daemon initialized.`);
    // console.log(`CreepDaemon - End: ${Game.cpu.getUsed()}`);
  }
}

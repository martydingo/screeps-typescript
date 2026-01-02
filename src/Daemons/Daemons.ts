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

declare global {
  interface Memory {
    jobs: { [key: string]: SpawnJob | LabJob };
  }
}

export class Daemons {
  public constructor() {
    if (!Memory.jobs) {
      Memory.jobs = {};
      Log(LogSeverity.DEBUG, "Daemons", `jobs memory not found, job memory initialised.`);
    }

    new TowerDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Tower daemon initialized.`);
    new SourceDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Source daemon initialized.`);
    new ControllerDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Controller daemon initialized.`);
    new SpawnDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Spawn daemon initialized.`);
    new CreepDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Creep daemon initialized.`);
    new ResourceDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Resource daemon initialized.`);
    new ConstructionDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Construction daemon initialized.`);
    new LinkDaemon();
    Log(LogSeverity.DEBUG, "Daemons", `Link daemon initialized.`);
    new ExtractorDaemon()
    Log(LogSeverity.DEBUG, "Daemons", `Extractor daemon initialized.`);
    new LabDaemon()
    Log(LogSeverity.DEBUG, "Daemons", `Lab daemon initialized.`);
  }
}

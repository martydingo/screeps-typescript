import { actionPhase } from "./actionPhase/actionPhase";
import { analysisPhase } from "./analysisPhase/analysisPhase";
import { log } from "../lib/utils/log";
import { monitorPhase } from "./monitorPhase/monitorPhase";

export class PhaseController {
  public constructor() {
    this.runPhases();
  }

  private runPhases() {
    log.debug("Running Phases");
    monitorPhase();
    analysisPhase();
    actionPhase();
  }
}

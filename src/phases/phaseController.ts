import { monitorPhase } from "./monitorPhase/monitorPhase";
import { log } from "../lib/utils/log";

export class PhaseController {
    constructor() {
        this.runPhases()
    }

    private runPhases() {
        log.debug("Running Phases")
        monitorPhase()
    }
}
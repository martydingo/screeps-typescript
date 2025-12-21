import { ConstructionDaemon } from "./ConstructionDaemon/ConstructionDaemon"
import { ControllerDaemon } from "./ControllerDaemon/ControllerDaemon"
import { CreepDaemon } from "./CreepDaemon/CreepDaemon"
import { SourceDaemon } from "./SourceDaemon/SourceDaemon"
import { SpawnDaemon, SpawnJob } from "./SpawnDaemon/SpawnDaemon"
import { TowerDaemon } from "./TowerDaemon/TowerDaemon"

declare global {
    interface Memory {
        jobs: { [key: string]: SpawnJob }
    }
}

export class Daemons {
    public constructor() {
        if (!Memory.jobs) {
            Memory.jobs = {}
        }

        new TowerDaemon()
        new SourceDaemon()
        new ControllerDaemon()
        new SpawnDaemon()
        new CreepDaemon()
        new ConstructionDaemon()
    }
}

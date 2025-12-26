import { BuildCreep } from "Creeps/BuildCreep";
import { ClaimCreep } from "Creeps/ClaimCreep";
import { ControllerCreep } from "Creeps/ControllerCreep";
import { SourceCreep } from "Creeps/SourceCreep";
import { SpawnCreep } from "Creeps/SpawnCreep";

export class CreepDaemon {
    public constructor() {
        new SourceCreep()
        new SpawnCreep()
        new ControllerCreep()
        new BuildCreep()
        new ClaimCreep()
    }
}

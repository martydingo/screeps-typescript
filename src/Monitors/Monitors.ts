import { RoomMonitor } from "Monitors/Room/RoomMonitor"
import { SpawnMonitor } from "Monitors/Spawn/SpawnMonitor"
import { StructureMonitor } from "./Structure/StructureMonitor"
import { Log, LogSeverity } from "utils/log";

export class Monitors {
    public constructor() {
        new RoomMonitor()
        Log(LogSeverity.DEBUG, "Monitors", `Room monitors initialized.`);
        new StructureMonitor()
        Log(LogSeverity.DEBUG, "Monitors", `Structure monitors initialised.`);
        new SpawnMonitor()
        Log(LogSeverity.DEBUG, "Monitors", `Spawn monitors initialised.`);
    }
}

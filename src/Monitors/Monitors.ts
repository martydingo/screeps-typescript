import { RoomMonitor } from "Monitors/Room/RoomMonitor"
import { SpawnMonitor } from "Monitors/Spawn/SpawnMonitor"
import { StructureMonitor } from "./Structure/StructureMonitor"
import {  profileClass } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

// )@profileClass()
export class Monitors {
    public static run(
    ) {
        RoomMonitor.run()
        Log(LogSeverity.DEBUG, "Monitors", `Room monitors initialized.`);
        StructureMonitor.run()
        Log(LogSeverity.DEBUG, "Monitors", `Structure monitors initialised.`);
        SpawnMonitor.run()
        Log(LogSeverity.DEBUG, "Monitors", `Spawn monitors initialised.`);
    }
}

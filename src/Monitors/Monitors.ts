import { RoomMonitor } from "Monitors/Room/RoomMonitor"
import { SpawnMonitor } from "Monitors/Spawn/SpawnMonitor"
import { StructureMonitor } from "./Structure/StructureMonitor"

export class Monitors {
    public constructor() {
        new RoomMonitor()
        new StructureMonitor()
        new SpawnMonitor()
    }
}

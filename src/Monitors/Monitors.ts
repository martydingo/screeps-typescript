import { RoomMonitor } from "Monitors/Room/RoomMonitor"
import { SpawnMonitor } from "Monitors/Spawn/SpawnMonitor"

export class Monitors {
    public constructor() {
        new RoomMonitor()
        new SpawnMonitor()
    }
}

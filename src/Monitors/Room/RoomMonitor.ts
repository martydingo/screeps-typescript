import { config } from "../../config"
import { ConstructionSiteMonitor } from "./ConstructionSiteMonitor"
import { ControllerMonitor } from "./ControllerMonitor"
import { HostileMonitor } from "./HostileMonitor"
import { ResourceMonitor } from "./ResourceMonitor"
import { SourceMonitor } from "./SourceMonitor"

interface RoomMonitorMemory {
        amount: number
        capacity: number

}

declare global {
    interface RoomMemory {
      energy?: RoomMonitorMemory;
    }
}

export class RoomMonitor {
    private rooms: string[]
    public constructor() {
        if (!Memory.rooms) {
            Memory.rooms = {}
        }

        this.rooms = [...Object.keys(Game.rooms), ...config.roomsToMine[Memory.env]];

        this.rooms.forEach((roomName) => {
            if (!Memory.rooms[roomName]) {
                Memory.rooms[roomName] = {}
            }
            this.monitorRoom(roomName)
        })

    }

    private monitorRoom(roomName: string) {

        if (Game.rooms[roomName]) {
            Memory.rooms[roomName].energy = {
                amount: Game.rooms[roomName].energyAvailable,
                capacity: Game.rooms[roomName].energyCapacityAvailable
            }
        }


        new SourceMonitor(roomName)
        new ControllerMonitor(roomName)
        new ResourceMonitor(roomName)
        new ConstructionSiteMonitor(roomName);
        new HostileMonitor(roomName)
    }
}

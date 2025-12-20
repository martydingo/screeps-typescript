import { config } from "../../config"
import { ControllerMonitor } from "./ControllerMonitor"
import { SourceMonitor } from "./SourceMonitor"

export class RoomMonitor {
    private rooms: string[]
    public constructor() {
        if (!Memory.rooms) {
            Memory.rooms = {}
        }

        this.rooms = [...Object.keys(Game.rooms), ...config.roomsToMine]

        this.rooms.forEach((roomName) => {
            if (!Memory.rooms[roomName]) {
                Memory.rooms[roomName] = {}
            }
            this.monitorRoom(roomName)
        })

    }

    private monitorRoom(roomName: string) {
        new SourceMonitor(roomName)
        new ControllerMonitor(roomName)
    }
}

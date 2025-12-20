import { config } from "../../config"

class RoomMonitor {
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
        })
    }
}

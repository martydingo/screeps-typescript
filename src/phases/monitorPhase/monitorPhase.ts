import { config } from "../../config/config";
import { monitorRoom } from "./subphases/monitorRoom/monitorRoom";
import { log } from "../../lib/utils/log";
import { getOwnedRooms } from "lib/utils/roomUtils";


export function monitorPhase() {
    log.debug("Running Monitor Phase")
    const roomsToMonitor: string[] = [...getOwnedRooms()]

    config.rooms.roomsToMine.forEach((roomName) => {
        if(Game.rooms[roomName]){
            roomsToMonitor.push(roomName)
        }
    })

    roomsToMonitor.forEach(roomName => {
        monitorRoom(roomName)
    })
}

import { config } from "../../config/config";
import { monitorRoom } from "./subphases/monitorRoom/monitorRoom";
import { log } from "../../lib/utils/log";


export function monitorPhase() {
    log.debug("Running Monitor Phase")
    const roomsToMonitor = config.rooms.activeRooms

    roomsToMonitor.forEach(roomName => {
        monitorRoom(roomName)
    })
}

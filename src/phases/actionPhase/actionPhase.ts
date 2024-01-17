import { config } from "config/config";
import { actionBots } from "./subphases/actionBots/actionBots";
import { actionSpawns } from "./subphases/actionSpawns/actionSpawns";
import { actionTowers } from "./subphases/actionStructures/actionTowers/actionTowers";

export function actionPhase() {
    actionSpawns()
    actionBots()

    const roomsToAction: string[] = config.rooms.activeRooms

    roomsToAction.forEach(roomName => {
        actionTowers(roomName)
    })

}

import { config } from "config/config";
import { actionBots } from "./subphases/actionBots/actionBots";
import { actionSpawns } from "./subphases/actionSpawns/actionSpawns";
import { actionTowers } from "./subphases/actionStructures/actionTowers/actionTowers";
import { actionLinks } from "./subphases/actionStructures/actionLinks/actionLinks";
import { getOwnedRooms } from "lib/utils/roomUtils";

export function actionPhase() {
    actionSpawns()
    actionBots()

    const roomsToAction: string[] =  [...getOwnedRooms()]

    roomsToAction.forEach(roomName => {
        actionTowers(roomName)
        actionLinks(roomName)
    })

}

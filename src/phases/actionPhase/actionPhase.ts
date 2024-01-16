import { actionBots } from "./subphases/actionBots/actionBots";
import { actionSpawns } from "./subphases/actionSpawns/actionSpawns";

export function actionPhase() {
    actionSpawns()
    actionBots()
}

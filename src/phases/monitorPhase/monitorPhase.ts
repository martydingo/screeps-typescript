import { monitorRooms } from "./subphases/monitorRoom/monitorRooms";
import { log } from "../../lib/utils/log";
import { getOwnedRooms } from "lib/utils/roomUtils";

export function monitorPhase() {
  log.debug("Running Monitor Phase");

  monitorRooms();
}

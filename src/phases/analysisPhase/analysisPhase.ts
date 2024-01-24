import { analyseRoom } from "./subphases/analyseRoom/analyseRoom";
import { config } from "config/config";
import { log } from "lib/utils/log";
import { analyseSpawning } from "./subphases/analyseSpawning/analyseSpawning";
import { getOwnedRooms } from "lib/utils/roomUtils";

function buildAnalysisMemory() {
  log.debug("Building Analysis Memory");
  if (!Memory.analysis) {
    Memory.analysis = {
      queues: {}
    } as AnalysisMemory;
  }
  if (!Memory.analysis.queues) {
    Memory.analysis.queues = {} as AnalysisMemory["queues"];
  }
}

export function analysisPhase() {
  log.debug("Running Analysis Phase");
  buildAnalysisMemory();

  analyseSpawning();

  const roomsToAnalyse = [...getOwnedRooms()];

  config.rooms.roomsToMine.forEach(roomName => {
    if (Game.rooms[roomName]) {
      roomsToAnalyse.push(roomName);
    } else {
      //
    }
  });

  roomsToAnalyse.forEach(roomName => {
    analyseRoom(roomName);
  });
}

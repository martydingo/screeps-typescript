import { ErrorMapper } from "lib/utils/ErrorMapper";
import { PhaseController } from "phases/phaseController";
import { log } from "lib/utils/log";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  log.info(`Current game tick is ${Game.time}`);
  log.debug("Starting Phase Controller")
  if (Game.cpu.bucket == 10000) {
    if (Game.cpu.generatePixel) {
      Game.cpu.generatePixel()
    }
  }
  new PhaseController()
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

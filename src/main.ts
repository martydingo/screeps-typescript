import { ErrorMapper } from "utils/ErrorMapper";
import { Monitors } from "Monitors/Monitors";
import { Daemons } from "Daemons/Daemons";
import { Log, LogSeverity } from "utils/log";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */

  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    env: "prod" | "dev";
  }
}
// Syntax for adding proprties to `global` (ex "global.log")
declare const global: {
  log: any;
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  Log(LogSeverity.INFORMATIONAL, "main", `Current game tick is ${Game.time}.`);

  if (Game.cpu.generatePixel) {
    Memory.env = "prod";
    if (Game.cpu.bucket === 10000) {
      Game.cpu.generatePixel();
      Log(
        LogSeverity.INFORMATIONAL,
        "main",
        `Generated pixel at ${Game.time} - total: ${Game.resources[PIXEL] as string}.`
      );
    }
  } else {
    Memory.env = "dev";
  }
  Log(LogSeverity.DEBUG, "main", `Environment defined as ${Memory.env}.`);

  Log(LogSeverity.DEBUG, "main", `Clearing creep memory.`);
  for (const name in Memory.creeps) {
    Log(LogSeverity.DEBUG, "main", `Checking ${name} in Memory.creeps.`);
    if (!(name in Game.creeps)) {
      Log(LogSeverity.DEBUG, "main", `Deleting old creep memory ${name} in Memory.creeps.`);
      delete Memory.creeps[name];
    }
  }

  new Monitors();
  Log(LogSeverity.DEBUG, "main", `Monitors initialized.`);
  new Daemons();
  Log(LogSeverity.DEBUG, "main", `Daemons initialized.`);
});

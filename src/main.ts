import { Daemons } from "Daemons/Daemons";
import { GlobalMonitor } from "Monitors/Global/GlobalMonitor";
import { Monitors } from "Monitors/Monitors";
import { ErrorMapper } from "utils/ErrorMapper";
import { ProfilerMemory, profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { Pathfinding } from "utils/Pathfinding";
import { MemStore } from "utils/Store/MemStore";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */

  // eslint-disable-next-line no-var

  // Memory extension samples
  interface Memory {
    profiler: ProfilerMemory;
    uuid: number;
    log: any;
    env: "prod" | "dev";
  }
}
// Syntax for adding proprties to `global` (ex "global.log")
declare const global: {
  log: any;
  store: Memory;
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

export const loop = ErrorMapper.wrapLoop(() => {
  global.store = Memory
  if (!global.store) {
    global.store = Memory
    console.log("x")
    // const memoryTemplate = {
    //   profiler: {},
    //   pathCache: {},
    //   heatMaps: {},
    //   creep: {},
    //   spawnHeld: {},
    //   jobs: {},
    //   global: {},
    // };
    // Object.keys(memoryTemplate).forEach((memoryKey) => {
    //   if (!global.store[memoryKey]) {
    //     global.store[memoryKey] = Memory[memoryKey] || {}
    //   }
    // })
  }

  Log(LogSeverity.INFORMATIONAL, "main", `Current game tick is ${Game.time}.`);

  if (Game.cpu.generatePixel) {
    global.store.env = "prod";
    // console.log(
    //   Game.market
    //     .getAllOrders(order => order.resourceType === PIXEL && order.type === ORDER_SELL)
    //     .sort((orderA, orderB) => orderA.price - orderB.price)
    //   .map((order)=>`Id: ${order.id} Price: ${order.price} Amount: ${order.amount} Resource ${order.resourceType}`)[0]
    // );
    if (Game.cpu.bucket === 10000) {
      Game.cpu.generatePixel();
      Log(
        LogSeverity.INFORMATIONAL,
        "main",
        `Generated pixel at ${Game.time} - total: ${Game.resources[PIXEL] as string}.`
      );
    }
  } else {
    global.store.env = "dev";
  }
  Log(LogSeverity.DEBUG, "main", `Environment defined as ${global.store.env}.`);

  Log(LogSeverity.DEBUG, "main", `Clearing creep memory.`);
  for (const name in global.store.creeps) {
    Log(LogSeverity.DEBUG, "main", `Checking ${name} in global.store.creeps.`);
    if (!(name in Game.creeps)) {
      Log(
        LogSeverity.DEBUG,
        "main",
        `Deleting old creep memory ${name} in global.store.creeps.`
      );
      delete global.store.creeps[name];
    }
  }

  // const route = Game.map.findRoute("E12S17", "E14S18", { routeCallback: Pathfinding.routeCallback});

  // console.log(JSON.stringify(route))

  Monitors.run();
  Log(LogSeverity.DEBUG, "main", `Monitors initialized.`);
  Daemons.run();
  Log(LogSeverity.DEBUG, "main", `Daemons initialized.`);

  GlobalMonitor.run();
  Log(LogSeverity.DEBUG, "Monitors", `Global monitor initialized.`);

  MemStore.setMemory(global.store);
});

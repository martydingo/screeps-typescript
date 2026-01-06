import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";

export interface TerminalMonitorMemory {
  [key: string]: {
    resources: {
      [key: string]: {
        amount: number;
        capacity: number;
      };
    };
  };
}


export class TerminalMonitor {
  @profileClass("TerminalMonitor")
  public static run(terminal: StructureTerminal) {
    if (!global.store.rooms[terminal.room.name].structures!.terminal!) {
      global.store.rooms[terminal.room.name].structures!.terminal = {};
      Log(
        LogSeverity.DEBUG,
        "TerminalMonitor",
        `terminal monitor memory not found, terminal monitor memory initialised.`
      );
    }

    const resources: { [key: string]: { amount: number; capacity: number } } = {};
    Object.keys(terminal.store).forEach(resourceName => {
      resources[resourceName] = {
        amount: terminal.store[resourceName as ResourceConstant],
        capacity: terminal.store.getCapacity(resourceName as ResourceConstant) || 3000
      };
    });

    global.store.rooms[terminal.room.name].structures!.terminal![terminal.id] = {
      resources
    };

    Log(LogSeverity.DEBUG, "TerminalMonitor", `terminal ${terminal.id}} monitored.`);
  }
}

import { profileClass } from "utils/Profiler";
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

@profileClass()
export class TerminalMonitor {
  public constructor(terminal: StructureTerminal) {
    if (!terminal.room.memory.structures!.terminal) {
      terminal.room.memory.structures!.terminal = {};
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

    terminal.room.memory.structures!.terminal[terminal.id] = {
      resources
    };

    Log(LogSeverity.DEBUG, "TerminalMonitor", `terminal ${terminal.id}} monitored.`);
  }
}

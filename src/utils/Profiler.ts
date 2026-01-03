/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */

declare global {
  interface Memory {
    profiler: {
      class: {
        [key: string]: {
          start: number;
          end: number;
          total: number;
        };
      };
      method: {
        [key: string]: {
          [key: number]: {
            start: number;
            end: number;
            total: number;
          };
        };
      };
      pollTime: { [key: string]: number };
    };
  }
}

function initialiseProfilerMemory() {
  if (!Memory.profiler) {
    Memory.profiler = {
      class: {},
      method: {},
      pollTime: {}
    };
  }
  if (!Memory.profiler.class) {
    Memory.profiler.class = {};
  }
  if (!Memory.profiler.method) {
    Memory.profiler.method = {};
  }
  if (!Memory.profiler.pollTime) {
    Memory.profiler.pollTime = {};
  }
}

export function profileClass() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      public constructor(...args: any[]) {
        initialiseProfilerMemory();
        const start = Game.cpu.getUsed();
        super(...args);
        const end = Game.cpu.getUsed();
        Memory.profiler.class[constructor.name] = {
          start,
          end,
          total: end - start
        };
      }
    };
  };
}

export function parameterProfiler(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

export function profileMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  initialiseProfilerMemory();
  const originalMethod = descriptor.value as Function;
  descriptor.value = function (...args: any[]) {
    const start = Game.cpu.getUsed();
    const result = originalMethod.apply(this, args);
    const end = Game.cpu.getUsed();

    const payload = {
      start,
      end,
      total: end - start
    };
    if (!Memory.profiler.pollTime[propertyKey]) {
      Memory.profiler.pollTime[propertyKey] = Game.time;
    } else {
      if (Memory.profiler.pollTime[propertyKey] !== Game.time) {
        delete Memory.profiler.method[propertyKey];
        Memory.profiler.pollTime[propertyKey] = Game.time;
      }
    }

    if (!Memory.profiler.method[propertyKey]) {
      Memory.profiler.method[propertyKey] = {};
    }
    const index = Object.values(Memory.profiler.method[propertyKey]).length + 1;
    Memory.profiler.method[propertyKey][index] = payload;

    return result;
  };
  return descriptor;
}

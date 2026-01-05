/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line max-classes-per-file

// eslint-disable-next-line max-classes-per-file
interface ProfilerMemory {
  class: ClassProfilerMemory;
  method: MethodProfilerMemory;
}

interface ClassProfilerMemory {
  [key: string]: ClassProfilerEntry;
}

interface ClassProfilerEntry {
  start: number;
  end: number;
  total: number;
}

interface MethodProfilerMemory {
  [key: string]: MethodProfilerEntry;
}

interface MethodProfilerEntry {
  time: number;
  calls: number;
  total: number;
  max: number;
}

declare global {
  interface Memory {
    profiler: ProfilerMemory;
  }
}

class Profiler {
  public constructor() {
    this.initialiseProfilerMemory();
  }

  private initialiseProfilerMemory() {
    if (!Memory.profiler) {
      Memory.profiler = {
        class: {},
        method: {}
      };
    }
    if (!Memory.profiler.class) {
      Memory.profiler.class = {};
    }
    if (!Memory.profiler.method) {
      Memory.profiler.method = {};
    }
  }

  public profileClass() {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
      return class extends constructor {
        public constructor(...args: any[]) {
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

  public profileMethod(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as Function;
    descriptor.value = function (...args: any[]) {
      const start = Game.cpu.getUsed();
      const result = originalMethod.apply(this, args);
      const end = Game.cpu.getUsed();
      const usedCpu = end - start;

      const curPayload = Memory.profiler.method[propertyKey];
      if (curPayload && curPayload.time === Game.time) {
                curPayload.calls += 1;
                curPayload.total += usedCpu;
                if (usedCpu > curPayload.max) curPayload.max = usedCpu;

      } else {
        Memory.profiler.method[propertyKey] = {
          time: Game.time,
          total: usedCpu,
          max: usedCpu,
          calls: 1
        };
      }

      //  = payload as MethodProfilerEntry;

      return result;
    };
    return descriptor;
  }
}

const ProfilerObj = new Profiler();
export const profileMethod = ProfilerObj.profileMethod;
export const profileClass = ProfilerObj.profileClass;

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line max-classes-per-file
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


class Profiler {
  public static run() {
    this.initialiseProfilerMemory();
  }

  private initialiseProfilerMemory() {
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

  public profileClass() {
    return function <T extends { new (...args: any[]): {} }>(static run: T) {
      return class extends static run {
        public static run(...args: any[]) {
          const start = Game.cpu.getUsed();
          super(...args);
          const end = Game.cpu.getUsed();
          Memory.profiler.class[static run.name] = {
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
}

const ProfilerObj = Profiler.run()
export const profileMethod = ProfilerObj.profileMethod;
export const profileClass = ProfilerObj.profileClass;

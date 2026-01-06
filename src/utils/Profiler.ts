/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line max-classes-per-file

// eslint-disable-next-line max-classes-per-file
export interface ProfilerMemory {
  class: ClassProfilerMemory;
  method: MethodProfilerMemory;
}

export interface ClassProfilerMemory {
  [key: string]: ClassProfilerEntry;
}

export interface ClassProfilerEntry {
  start: number;
  end: number;
  total: number;
}

export interface MethodProfilerMemory {
  [key: string]: MethodProfilerEntry;
}

export interface MethodProfilerEntry {
  time: number;
  calls: number;
  total: number;
  max: number;
}

class Profiler {
  public static initalise() {
    this.initialiseProfilerMemory();
  }

  private static initialiseProfilerMemory() {
    if (!global.store) {
      global.store = Memory
    }

    if (!global.store.profiler) {
      global.store.profiler = {
        class: {},
        method: {}
      };
    }
    if (!global.store.profiler.class) {
      global.store.profiler.class = {}
    }
    if (!global.store.profiler.method) {
      global.store.profiler.method = {}
    }
  }

  // public profileClass() {
  //   return function <T extends { new (...args: any[]): {} }>(constructor: T) {
  //     return class extends constructor {
  //       public constructor(...args: any[]) {
  //         const start = Game.cpu.getUsed();
  //         super(...args);
  //         const end = Game.cpu.getUsed();
  //         global.store.profiler.class[constructor.name] = {
  //           start,
  //           end,
  //           total: end - start
  //         };
  //       }
  //     };
  //   };
  // }

  public static profileClass(
    name: string,

  ) {
    if (!global.store.profiler.class) {
      global.store.profiler.class = {}
    }
    return function (target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value as Function;
      descriptor.value = function (...args: any[]) {
        const start = Game.cpu.getUsed();
        const result = originalMethod.apply(this, args);
        const end = Game.cpu.getUsed();
        if (!global.store.profiler.class) {
          global.store.profiler.class = {}
        }
        global.store.profiler.class[name] = {
          start,
          end,
          total: end - start
        };

        //  = payload as MethodProfilerEntry;

        return result;
      };
      return descriptor;
    }
  }

  public static profileMethod(
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

      const curPayload = global.store.profiler.method[propertyKey];
      if (curPayload && curPayload.time === Game.time) {
        curPayload.calls += 1;
        curPayload.total += usedCpu;
        if (usedCpu > curPayload.max) curPayload.max = usedCpu;
      } else {
        global.store.profiler.method[propertyKey] = {
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

Profiler.initalise();
export const profileMethod = Profiler.profileMethod;
export const profileClass = Profiler.profileClass;

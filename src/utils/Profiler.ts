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
    };
  }
}

export function profileClass() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    if (!Memory.profiler) {
      Memory.profiler = {
        class: {}
      };
    }
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

export function parameterProfiler(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(originalMethod.name);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

export function methodProfiler(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value as Function;
  descriptor.value = function (...args: any[]) {
    // console.log(`Start ${originalMethod.name} - ${Game.cpu.getUsed()}`);
    const result = originalMethod.apply(this, args);
    // console.log(`End ${originalMethod.name} - ${Game.cpu.getUsed()}`);

    // console.log(`${propertyKey} executed in ${(end - start).toFixed(2)}ms`);
    return result;
  };
  return descriptor;
}

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RoomPathCache } from "utils/Pathfinding";
import { ProfilerMemory } from "utils/Profiler";

/* eslint-disable no-underscore-dangle */
declare global {
  // eslint-disable-next-line no-var
  var store: Memory;

  interface Memory {
    [key: string]: object
  }
}

export class MemStore {
  public static recurseObject(object: any, key?: string, curStore?: object) {
    let curObject = object;
    let objType = typeof object;
    let workingStore = global.store

    if (key) {
      curObject = object[key];
      objType = typeof object[key];
    }

    if (curStore) {
      workingStore = curStore as Memory;
    }

    if (objType === "object") {
      Object.keys(curObject).forEach(objKey => {
        workingStore[objKey] = {}
        MemStore.recurseObject(object[objKey], objKey, workingStore);
      });
    } else {
      if (key) {
        workingStore[key] = object;
      }
    }
  }

  public static setMemory(object?: any, key?: string) {
    let curObject = object
    let objType = typeof object

    if (key) {
      curObject = object[key];
      objType = typeof object[key];
    }

    if (objType === "object") {
      Object.keys(curObject).forEach(objKey => {
        Memory[objKey] = curObject[objKey]
      });
    }
  }
  // public static setMemory(object?: any, key?: string) {
  //   let curObject = object
  //   let objType = typeof object

  //   if (key) {
  //     curObject = object[key];
  //     objType = typeof object[key];
  //   }
  //   console.log(objType)

  //   if (objType === "object") {
  //     Object.keys(curObject).forEach(objKey => {
  //       Memory[objKey] = {}
  //       console.log(objKey)
  //       MemStore.recurseObject(object[objKey], objKey);
  //     });
  //   } else {
  //     if (key) {
  //       console.log(key)
  //       Memory[key] = object;
  //     }
  //   }

  //   console.log(global.store.global.time)
  //   console.log(global.store.global.time)
  // }

  public static test() {
    this.recurseObject(global.store);
    Object.keys(global.store!).forEach((keyName) => {

      console.log(`outerKey: ${keyName}`)
      Object.keys(global.store![keyName]).forEach((innerKeyName) => {
        console.log(`innerKey: ${innerKeyName}`)


      })
    })
  }
}

import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";
import { LabJob, LabTask } from "Daemons/LabDaemon/LabDaemon";

interface LabCreepMemory extends CreepMemoryTemplate {
  origin: string;
  destination: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<LabCreepMemory> {}
}


export class LabCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  @profileClass("LabCreep")
  public static run() {


    const labJobs = Object.values(global.store.jobs).filter(job => job.type === "lab") as LabJob[];

    Object.values(Game.creeps)
      .filter(creep => global.store.creeps[creep.name].type === "LabCreep")
      .forEach(labCreep => {
        const roomLabJobs = labJobs.filter(labJob => labJob.room === global.store.creeps[labCreep.name].room!);
        const priorityLevels: Set<number> = new Set();

        let curTask: LabTask;
        let curJob: LabJob;

        roomLabJobs.forEach(labJob => {
          const roomLabTasks = Object.values(labJob.tasks as { [key: string]: LabTask });
          roomLabTasks
            .sort((taskA, taskB) => taskA.priority - taskB.priority)
            .forEach(task => {
              priorityLevels.add(task.priority);
            });
        });

        let haltTaskProcessing = false;
        priorityLevels.forEach(priorityLevel => {
          if (haltTaskProcessing === false) {
            roomLabJobs.forEach(roomLabJob => {
              const curRoomLabTasks = Object.entries(roomLabJob.tasks as { [key: string]: LabTask }).filter(
                ([, labTask]) => labTask.priority === priorityLevel && labTask.status === "pending"
              );
              if (curRoomLabTasks.length > 0) {
                haltTaskProcessing = true;
                curTask = curRoomLabTasks[0][1];
                curJob = roomLabJob;

                // const destination = Game.getObjectById(curTask.structure);
                // if (destination) {
                // if (curTask.amount - destination.store[curTask.resource] < 0) {
                //   return this.returnExcessInventory(labCreep, curTask);
                // } else {
                //   // console.log(curTask.amount)
                //   // console.log(curTask.resource)
                //   // console.log(curTask.structure)
                //   if (labCreep.store.getUsedCapacity() !== 0 && labCreep.store[curTask.resource] === 0 ) {
                //     const storage = labCreep.room.storage;
                //     if (storage) {
                //       Object.keys(labCreep.store).forEach(storeResourceType => {
                //         return labCreep.depositResourceIntoStructure(storage, storeResourceType as ResourceConstant);
                //       });
                //     }
                //   }

                if (global.store.creeps[labCreep.name].curTask === "spawning" && labCreep.spawning === false) {
                  global.store.creeps[labCreep.name].curTask = "fetchingResource";
                  Log(LogSeverity.DEBUG, "LabCreep", `${labCreep.name} has spawned, task set to "fetchingResource"`);

                }
                 if(labCreep.spawning) return

                if (global.store.creeps[labCreep.name].curTask === "fetchingResource") {
                  if (labCreep.store.getUsedCapacity() > 0) {
                    global.store.creeps[labCreep.name].curTask = "depositingResource";
                    Log(
                      LogSeverity.DEBUG,
                      "LabCreep",
                      `${labCreep.name}'s store is full, task set to "depositingResource"`
                    );
                  }
                } else {
                  if (labCreep.store.getUsedCapacity() === 0) {
                    global.store.creeps[labCreep.name].curTask = "fetchingResource";
                    Log(
                      LogSeverity.DEBUG,
                      "LabCreep",
                      `${labCreep.name}'s store is empty, task set to "fetchingResource"`
                    );
                  }
                }
                if (labCreep.store.getUsedCapacity() > 0 && labCreep.store[curTask.resource] === 0) {
                  global.store.creeps[labCreep.name].curTask = "emptyingResource";
                }

                switch (global.store.creeps[labCreep.name].curTask) {
                  case "fetchingResource":
                    this.fetchResource(labCreep, curTask);

                    break;
                  case "depositingResource":
                    this.depositResource(labCreep, curTask);
                    break;
                  case "emptyingResource":
                    this.emptyResources(labCreep, curTask);
                    break;
                }
                // }
                // }
              } else {
                if (labCreep.store.getUsedCapacity() > 0) {
                  const terminal = labCreep.room.terminal;
                  if (terminal) {
                    Object.keys(labCreep.store).forEach(storeResourceType => {
                      const depositResult = labCreep.depositResourceIntoStructure(
                        terminal,
                        storeResourceType as ResourceConstant
                      );
                    });
                  }
                }
              }
            });
          }
        });
      });
  }

 @profileMethod
private static fetchResource(labCreep: Creep, task: LabTask) {
    const resourceType = task.resource;
    const room = Game.rooms[global.store.creeps[labCreep.name].room!];
    const destinationId = task.structure;
    const destination = Game.getObjectById(destinationId);
    if (destination) {
      if (room && labCreep.pos.roomName === global.store.creeps[labCreep.name].room!) {
        if (room.storage) {
          if (room.storage.store[resourceType] > 0) {
            const fetchResult = labCreep.fetchResourceFromStorage(resourceType);
            return fetchResult;
          } else {
            if (room.terminal) {
              if (room.terminal.store[resourceType] > 0) {
                const fetchResult = labCreep.fetchResourceFromTerminal(resourceType);
                return fetchResult;
              }
            }
          }
        } else {
          if (room.terminal) {
            if (room.terminal.store[resourceType] > 0) {
              const fetchResult = labCreep.fetchResourceFromTerminal(resourceType);
              return fetchResult;
            }
          }
        }
      }
    }

    return ERR_INVALID_TARGET;
    //
  }

 @profileMethod
private static depositResource(labCreep: Creep, task: LabTask) {
    const destination = Game.getObjectById(task.structure);
    if (destination) {
      const depositResult = labCreep.depositResourceIntoStructure(destination, task.resource);
    }
  }

 @profileMethod
private static emptyResources(labCreep: Creep, task: LabTask) {
    const storage = labCreep.room.storage;
    if (storage) {
      let incorrectResourceInStore = false;
      Object.keys(labCreep.store).forEach(storeResourceType => {
        if (task.resource !== storeResourceType) {
          incorrectResourceInStore = true;
          const depositResult = labCreep.depositResourceIntoStructure(storage, storeResourceType as ResourceConstant);
        }
      });

      if (incorrectResourceInStore === false) {
        global.store.creeps[labCreep.name].curTask = "fetchingResource";
      }
    }
  }
}

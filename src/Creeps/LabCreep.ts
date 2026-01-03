import { profileClass } from "utils/Profiler";
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

@profileClass()
export class LabCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  public constructor() {
    super();

    const labJobs = Object.values(Memory.jobs).filter(job => job.type === "lab") as LabJob[];

    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "LabCreep")
      .forEach(labCreep => {
        const roomLabJobs = labJobs.filter(labJob => labJob.room === labCreep.memory.room!);
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

                if (labCreep.memory.curTask === "spawning" && labCreep.spawning === false) {
                  labCreep.memory.curTask = "fetchingResource";
                  Log(LogSeverity.DEBUG, "LabCreep", `${labCreep.name} has spawned, task set to "fetchingResource"`);
                }

                if (labCreep.memory.curTask === "fetchingResource") {
                  if (labCreep.store.getUsedCapacity() > 0) {
                    labCreep.memory.curTask = "depositingResource";
                    Log(
                      LogSeverity.DEBUG,
                      "LabCreep",
                      `${labCreep.name}'s store is full, task set to "depositingResource"`
                    );
                  }
                } else {
                  if (labCreep.store.getUsedCapacity() === 0) {
                    labCreep.memory.curTask = "fetchingResource";
                    Log(
                      LogSeverity.DEBUG,
                      "LabCreep",
                      `${labCreep.name}'s store is empty, task set to "fetchingResource"`
                    );
                  }
                }
                if (labCreep.store.getUsedCapacity() > 0 && labCreep.store[curTask.resource] === 0) {
                  labCreep.memory.curTask = "emptyingResource";
                }

                switch (labCreep.memory.curTask) {
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

  private fetchResource(labCreep: Creep, task: LabTask) {
    const resourceType = task.resource;
    const room = Game.rooms[labCreep.memory.room!];
    const destinationId = task.structure;
    const destination = Game.getObjectById(destinationId);
    if (destination) {
      if (room && labCreep.pos.roomName === labCreep.memory.room!) {
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

  private depositResource(labCreep: Creep, task: LabTask) {
    const destination = Game.getObjectById(task.structure);
    if (destination) {
      const depositResult = labCreep.depositResourceIntoStructure(destination, task.resource);
    }
  }

  private emptyResources(labCreep: Creep, task: LabTask) {
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
        labCreep.memory.curTask = "fetchingResource";
      }
    }
  }
}

import { LabConfig, config } from "config";
import { LabCreep } from "Creeps/LabCreep";
import { SpawnJob } from "Daemons/SpawnDaemon/SpawnDaemon";
import { profileClass, profileMethod } from "utils/Profiler";

export interface LabTask {
  resource: ResourceConstant;
  structure: Id<StructureLab> | Id<StructureContainer>;
  priority: number;
  status: "pending" | "assigned" | "done";
  assignedCreep?: Id<Creep>;
}

export interface LabJob {
  name: string;
  room: string;
  recipe: MineralCompoundConstant;
  tasks: { [key: string]: LabTask };
  config: LabConfig;
  type: "lab";
}

@profileClass()
export class LabDaemon {
  public static run() {
    const roomsWithLabs: string[] = [];
    Object.values(Game.structures)
      .filter(structure => structure.structureType === STRUCTURE_LAB)
      .forEach(
        lab =>
          !roomsWithLabs.includes(lab.pos.roomName) &&
          roomsWithLabs.push(lab.pos.roomName)
      );

    roomsWithLabs.forEach(roomName => {
      LabDaemon.manageLabJobs(roomName);
      LabDaemon.manageLabCreeps(roomName);
      LabDaemon.operateLabs(roomName);
    });
  }

 @profileMethod
  private static manageLabJobs(roomName: string) {
    const roomlabConfigs = config[Memory.env].labConfig[roomName];
    if (roomlabConfigs) {
      Object.values(roomlabConfigs).forEach(roomlabConfig => {
        const recipe = roomlabConfig.recipe;
        if (!Memory.jobs[`${roomName}-${recipe}`]) {
          const components: string[] = [];
          Object.entries(REACTIONS).forEach(([componentA, subReaction]) => {
            Object.entries(subReaction).forEach(([, reactionResult]) => {
              if (reactionResult === recipe) {
                components.push(componentA);
              }
            });
          });

          const primaryLabId = roomlabConfig.labs.primary.lab;
          const secondaryLabIds = Object.values(roomlabConfig.labs.secondaries)
            .sort((labIdA, labIdB) => labIdA.localeCompare(labIdB))
            .map(labId => labId);

          const primaryLab = Game.getObjectById(primaryLabId as Id<StructureLab>);
          if (primaryLab) {
            const secondaryLabs = secondaryLabIds
              .map(secondaryLabId =>
                Game.getObjectById(secondaryLabId as Id<StructureLab>)
              )
              .filter(secondaryLab => secondaryLab !== null);

            const labJobs = Object.entries(Memory.jobs).filter(
              ([, job]) => job.type === "lab"
            ) as [string, LabJob][];
            const labJobsInRoom = labJobs.filter(
              ([, labJob]) => labJob.room === roomName
            );

            if (secondaryLabs.length >= 2) {
              const taskTemplate: { normal: LabTask[]; booster: LabTask[] } = {
                normal: [],
                booster: [
                  {
                    resource: recipe,
                    structure: primaryLab.id,
                    priority: 1,
                    status: "pending"
                  },
                  {
                    resource: RESOURCE_ENERGY,
                    structure: primaryLab.id,
                    priority: 2,
                    status: "pending"
                  },
                  ...Object.values(secondaryLabs).map((lab, index) => {
                    return {
                      resource: RESOURCE_ENERGY,
                      structure: lab!.id,
                      priority: 3 + index,
                      status: "pending"
                    } as LabTask;
                  }),
                  ...Object.values(components).map((component, index) => {
                    return {
                      resource: component,
                      structure: secondaryLabs[index]!.id,
                      priority: 5 + index,
                      status: "pending"
                    } as LabTask;
                  })
                ]
              };

              if (labJobsInRoom.length === 0) {
                const labTasks: { [key: string]: LabTask } = {};
                const labOpMode =
                  (roomlabConfig.labs.primary.boost && "booster") || "normal";

                Object.values(taskTemplate[labOpMode]).forEach(labTask => {
                  labTasks[`${roomName}-${labTask.resource}-${labTask.structure}`] =
                    labTask;
                });

                const labJob: LabJob = {
                  name: `make-${recipe}`,
                  room: roomName,
                  recipe,
                  tasks: labTasks,
                  type: "lab",
                  config: roomlabConfig
                };
                Memory.jobs[`${roomName}-${recipe}`] = labJob;
              }
            }
          }
        } else {
          const labJob = Memory.jobs[`${roomName}-${recipe}`] as LabJob;
          const labTasks = labJob.tasks;

          Object.entries(labTasks).forEach(([taskName, task]) => {
            const structure = Game.getObjectById(task.structure);
            if (structure) {
              const capacity = structure.store.getCapacity(task.resource);
              if (structure.store[task.resource] > capacity! * 0.8) {
                labJob.tasks[taskName].status = "done";
              } else {
                labJob.tasks[taskName].status = "pending";
              }
              Memory.jobs[`${roomName}-${recipe}`] = labJob;
            }
          });
        }
      });
    }
  }
 @profileMethod
  private static manageLabCreeps(roomName: string) {
    const labJobs = Object.entries(Memory.jobs).filter(
      ([, job]) => job.type === "lab"
    ) as [string, LabJob][];
    const roomLabJobs = Object.values(labJobs).filter(
      ([, labJob]) => labJob.room === roomName
    );

    const requiredMinerals: ResourceConstant[] = [];

    Object.values(roomLabJobs).forEach(([, roomLabJob]) =>
      Object.values(roomLabJob.tasks).forEach(roomLabTask => {
        if (!requiredMinerals.includes(roomLabTask.resource)) {
          requiredMinerals.push(roomLabTask.resource);
        }
      })
    );

    const room = Game.rooms[roomName];

    if (room) {
      const storage = room.storage;
      const terminal = room.terminal;

      let mineralsFound = false;
      if (storage && terminal) {
        Object.values(requiredMinerals).forEach(mineral => {
          if (storage.store[mineral] > 0 || terminal.store[mineral] > 0) {
            mineralsFound = true;
          }
        });

        const labsUnderCapacity = Object.values(requiredMinerals).map(resourceName => {
          let labUnderCapacity = false;
          let amount = 0;
          let capacity = 0;
          Object.values(room.memory.structures!.labs!).forEach(labMonitorMemory => {
            if (labMonitorMemory.resources[resourceName]) {
              amount = amount + labMonitorMemory.resources[resourceName].amount;
              capacity = labMonitorMemory.resources[resourceName].capacity;
            } else {
              amount = amount + 0;
            }
          });

          if (amount <= capacity * 0.25) {
            labUnderCapacity = true;
          }
          return labUnderCapacity;
        });
        // console.log(labsUnderCapacity.includes(true));
        // console.log(mineralsFound && labsUnderCapacity.includes(true));
        if (mineralsFound && labsUnderCapacity.includes(true)) {
          const labCreeps = Object.values(Game.creeps).filter(
            creep => creep.memory.type === "LabCreep"
          );

          const spawnJobs = Object.values(Memory.jobs).filter(
            job => job.type === "spawn"
          ) as SpawnJob[];
          const assignedJobs = Object.values(spawnJobs).filter(
            spawnJob => spawnJob.params.memory.type === "LabCreep"
          );

          const requestedCreeps = 1;
          if (
            roomLabJobs.length > 0 &&
            labCreeps.length < requestedCreeps &&
            assignedJobs.length === 0
          ) {
            Memory.jobs[`LabCreep-${roomName}-${Game.time}`] = {
              type: "spawn",
              name: `LabCreep-${roomName}-${Game.time}`,
              bodyPartRatio: LabCreep.bodyPartRatio,
              status: "pending",
              priority: 5,
              params: {
                memory: {
                  type: "LabCreep",
                  room: roomName,
                  curTask: "spawning"
                }
              }
            };
          }
        }
      }
    }
  }
 @profileMethod
  private static operateLabs(roomName: string) {
    const roomlabConfigs = config[Memory.env].labConfig[roomName];
    if (roomlabConfigs) {
      Object.values(roomlabConfigs).forEach(roomlabConfig => {
        const primaryLab = Game.getObjectById(
          roomlabConfig.labs.primary.lab as Id<StructureLab>
        );
        const secondaryLabs: StructureLab[] = [];
        Object.values(roomlabConfig.labs.secondaries).forEach(labId => {
          const lab = Game.getObjectById(labId as Id<StructureLab>);
          if (lab) {
            secondaryLabs.push(lab);
          }
        });

        if (primaryLab) {
          const reactionResult = primaryLab.runReaction(
            secondaryLabs[0],
            secondaryLabs[1]
          );
        }
      });
    }
  }
}

import { Log } from "classes/Log";
import { base64 } from "common/utilities/base64";

export class LootResourceJob {
  public JobParameters: LootResourceJobParameters;
  public constructor(JobParameters: LootResourceJobParameters, count = 1) {
    this.JobParameters = JobParameters;
    Object.entries(Memory.queues.jobs)
      .filter(([, jobMemory]) => jobMemory.jobParameters.jobType === this.JobParameters.jobType)
      .forEach(([jobUUID, jobMemory]) => {
        if (jobMemory.index > count) {
          this.deleteJob(jobUUID);
        }
      });
    if (count === 1) {
      const UUID = base64.encode(`${this.JobParameters.jobType}-${this.JobParameters.room}-1`);
      this.createJob(UUID, 1);
    } else {
      let iterations = 1;
      while (iterations <= count) {
        const UUID = base64.encode(`${this.JobParameters.jobType}-${this.JobParameters.room}-${iterations}`);
        this.createJob(UUID, iterations);
        iterations++;
      }
    }
  }
  private createJob(UUID: string, index: number) {
    if (!Memory.queues.jobs[UUID]) {
      Log.Informational(
        `Creating "LootResourceJob" for Tower ID "${this.JobParameters.room} with the UUID of ${UUID}"`
      );
      Memory.queues.jobs[UUID] = {
        jobParameters: {
          uuid: UUID,
          status: "fetchingResource",
          room: this.JobParameters.room,
          jobType: "lootResource"
        },
        index,
        room: this.JobParameters.room,
        jobType: "lootResource",
        timeAdded: Game.time
      };
    }
  }
  private deleteJob(UUID: string) {
    if (Memory.queues.jobs[UUID]) {
      Log.Informational(
        `Deleting "LootResourceJob" for Tower ID "${this.JobParameters.room} with the UUID of ${UUID}"`
      );
      delete Memory.queues.jobs[UUID];
    }
  }
}

interface GlobalMonitorMemory {
  gcl: {
    level: number;
    progress: number;
    nextLevel: number;
  };
  cpu: {
    current: number;
    bucket: number;
  };
    // memory: number
}

declare global {
    interface Memory {
        global: Partial<GlobalMonitorMemory>
    }
}

export class GlobalMonitor {
    public constructor() {
        const payload: GlobalMonitorMemory = {
          gcl: {
            level: Game.gcl.level,
            progress: Game.gcl.progress,
            nextLevel: Game.gcl.progressTotal
            },
            cpu: {
                current: Game.cpu.getUsed(),
                bucket: Game.cpu.bucket
            },
            // memory: Game.cpu.getHeapStatistics!()
        };

        Memory.global = payload
    }


}

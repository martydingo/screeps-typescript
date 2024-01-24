export {};
declare global {
  interface SpawnQueueEntry {
    name: string;
    room: string | { spawnRoom: string; botRoom: string };
    priority: number;
    parts: BodyPartConstant[];
    memory: BotMemory;
    status: string;
  }

  interface SpawnQueueData {
    [key: string]: SpawnQueueEntry;
  }
}

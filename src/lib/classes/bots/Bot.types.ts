export {};

declare global {
  interface BotMemory {
    role: string;
    room: string;
    params: any;
    status?: string;
  }
  type CreepMemory = BotMemory;
}

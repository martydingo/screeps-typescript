export {};

declare global {
  interface RoomConfiguration {
    [environment: string]: {
      roomsToMine: string[];
    };
  }
}

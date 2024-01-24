export {};

declare global {
    type RoomConfiguration = {
        [environment: string]: {
            roomsToMine: string[];
        }
    };
}

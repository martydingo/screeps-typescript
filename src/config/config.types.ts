export {};

declare global {
    type Configuration = {
        rooms: RoomConfiguration
        logging: LogConfiguration
    }
}

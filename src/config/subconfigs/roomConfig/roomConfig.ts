import { getOwnedRooms } from "../../../lib/utils/roomUtils";

const userRoomConfig: RoomConfiguration = {
    activeRooms: []
}

export const roomConfig: RoomConfiguration = {
    activeRooms: [...userRoomConfig.activeRooms, ...getOwnedRooms()]
}

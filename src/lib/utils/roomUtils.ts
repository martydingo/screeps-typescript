export function getOwnedRooms() {
    return Object.keys(Game.rooms).filter(roomName => Game.rooms[roomName].controller && Game.rooms[roomName].controller?.my);
}

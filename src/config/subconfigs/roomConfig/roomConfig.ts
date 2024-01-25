export const roomConfig: RoomConfiguration = {
  development: {
    roomsToMine: ["W8N2"],
    roomsToClaim: ["W7N3"]
  },
  staging: {
    roomsToMine: ["W8N2"],
    roomsToClaim: []
  },
  production: {
    roomsToMine: [],
    roomsToClaim: ["E58S57"]
  }
};

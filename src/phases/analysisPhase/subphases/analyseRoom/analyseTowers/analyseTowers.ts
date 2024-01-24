import { TransportBot } from "lib/classes/bots/TransportBot/TransportBot";

function createTransportBotJob(roomName: string) {
  const transportBot = new TransportBot(roomName, {
    dropOff: "towers"
  });
  if (!Game.creeps[transportBot.name]) {
    Memory.analysis.queues.spawn[transportBot.name] = {
      name: transportBot.name,
      room: roomName,
      priority: transportBot.priority,
      parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
      memory: transportBot.memory,
      status: "new"
    };
  } else {
    delete Memory.analysis.queues.spawn[transportBot.name];
  }
}

export function analyseTowers(roomName: string) {
  const towersInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.towers);
  if (towersInRoom.length > 0) {
    createTransportBotJob(roomName);
  }
}

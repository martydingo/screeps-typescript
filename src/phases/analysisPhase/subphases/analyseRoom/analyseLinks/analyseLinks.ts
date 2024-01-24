import { config } from "config/config";
import { TransportBot } from "lib/classes/bots/TransportBot/TransportBot";

function buildLinkAnalysisMemory(roomName: string) {
  if (!Memory.rooms[roomName].analysis.links) {
    Memory.rooms[roomName].analysis.links = {};
  }
}

function setLinkConfig(roomName: string, link: StructureLink) {
  const linkConfig = config.links[link.id];
  if (linkConfig) {
    Memory.rooms[roomName].analysis.links[link.id] = {
      mode: linkConfig.mode
    };
  }
}

function createLinkTransportJob(roomName: string) {
  const linkTransportBot = new TransportBot(roomName, { dropOff: "links" });
  if (!Game.creeps[linkTransportBot.name]) {
    Memory.analysis.queues.spawn[linkTransportBot.name] = {
      name: linkTransportBot.name,
      room: roomName,
      priority: linkTransportBot.priority,
      parts: linkTransportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
      memory: linkTransportBot.memory,
      status: "new"
    };
  } else {
    delete Memory.analysis.queues.spawn[linkTransportBot.name];
  }
}

export function analyseLinks(roomName: string) {
  buildLinkAnalysisMemory(roomName);

  const linksInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.links).map(linkId =>
    Game.getObjectById(linkId as Id<StructureLink>)
  ) as StructureLink[];

  linksInRoom.forEach(link => {
    setLinkConfig(roomName, link);
  });

  const linksToSend = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "send");

  if (linksToSend.length > 0) {
    createLinkTransportJob(roomName);
  }
}

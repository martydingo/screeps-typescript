export function actionLinks(roomName: string) {
  const linksInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.links).map(linkId =>
    Game.getObjectById(linkId as Id<StructureLink>)
  ) as StructureLink[];
  const linksToSend = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "send");
  const linksToRecieve = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "receive");

  const nextLinkToSendFrom = linksToSend.sort(
    (linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY]
  )[0];
  const nextLinkToSendTo = linksToRecieve.sort(
    (linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY]
  )[0];

  if (nextLinkToSendFrom && nextLinkToSendTo) {
    if (nextLinkToSendFrom.cooldown === 0) {
      nextLinkToSendFrom.transferEnergy(nextLinkToSendTo);
    }
  }
}

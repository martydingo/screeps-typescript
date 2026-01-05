import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface LinkCreepMemory extends CreepMemoryTemplate {
  assignedLink: Id<StructureLink>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<LinkCreepMemory> {}
}

@profileClass()
export class LinkCreep extends CreepTemplate {
  public static bodyPartRatio = { work: 0, carry: 1, move: 1 };

  public static run() {


    Object.values(Game.creeps)
      .filter(creep => creep.memory.type === "LinkCreep")
      .forEach(linkCreep => {
        if (linkCreep.memory.curTask === "spawning" && linkCreep.spawning === false) {
          linkCreep.memory.curTask = "fetchingEnergy";
          Log(LogSeverity.DEBUG, "LinkCreep", `${linkCreep.name} has spawned, task set to "fetchingEnergy"`);

        }
         if(linkCreep.spawning) return

        if (linkCreep.memory.curTask === "fetchingEnergy") {
          if (linkCreep.store.getUsedCapacity() >= linkCreep.store.getCapacity()) {
            linkCreep.memory.curTask = "depositingEnergy";
            Log(LogSeverity.DEBUG, "LinkCreep", `${linkCreep.name}'s store is full, task set to "depositingEnergy"`);
          }
        } else {
          if (linkCreep.store.getUsedCapacity() === 0) {
            linkCreep.memory.curTask = "fetchingEnergy";
            Log(LogSeverity.DEBUG, "LinkCreep", `${linkCreep.name}'s store is empty, task set to "fetchingEnergy"`);
          }
        }

        switch (linkCreep.memory.curTask) {
          case "fetchingEnergy":
            this.fetchEnergy(linkCreep)
            break;
          case "depositingEnergy":
            this.depositEnergy(linkCreep);
        }
      });
  }

  @profileMethod
private static fetchEnergy(linkCreep: Creep) {
    const linkAnchor = Game.flags[`link-anchor-${linkCreep.memory.assignedLink as string}`];
    if (linkAnchor) {
      if (linkCreep.pos.getRangeTo(linkAnchor) > 0) {
        const moveResult = linkCreep.moveTo(linkAnchor.pos);
        if (moveResult === OK) {
          Log(
            LogSeverity.DEBUG,
            "LinkCreep",
            `${linkCreep.name} is not in range of link anchor point ${linkAnchor.name} (${linkAnchor.pos.x}, ${linkAnchor.pos.y}, ${linkAnchor.pos.roomName}), and has moved closer.`
          );
        } else {
          Log(
            LogSeverity.ERROR,
            "LinkCreep",
            `${linkCreep.name} is not in range of link anchor point ${linkAnchor.name} (${linkAnchor.pos.x}, ${linkAnchor.pos.y}, ${linkAnchor.pos.roomName}), and has failed to moved closer with a result of ${moveResult}. `
          );
        }
      } else {
        linkCreep.fetchResourceFromStorage(RESOURCE_ENERGY)
      }
    }
  }

  @profileMethod
private static depositEnergy(linkCreep: Creep) {
    const linkIds: Id<StructureLink>[] = []
    const room = Game.rooms[linkCreep.memory.room!]
    if (room) {
      const structureMemory = room.memory.structures
      if (structureMemory) {
        const linksMemory = structureMemory.links
        if (linksMemory) {
          Object.entries(linksMemory)
            .filter(([, linkMemory]) => linkMemory.linkType === "storage")
            .forEach(([linkId]) => linkIds.push(linkId as Id<StructureLink>));
        }
      }
    }

    const sourceLinks: StructureLink[] = []

    linkIds.forEach((linkId) => {
      const sourceLink = Game.getObjectById(linkId)
      if (sourceLink) {
        sourceLinks.push(sourceLink)
      }
    })

    sourceLinks.forEach((sourceLink) => {

      const depositResult = linkCreep.transfer(sourceLink, RESOURCE_ENERGY);
        if (depositResult !== OK && depositResult !== ERR_FULL) {
          Log(
            LogSeverity.ERROR,
            "LinkCreep",
            `${linkCreep.name} has failed to deposit energy into link ${sourceLink.id} in ${sourceLink.pos.roomName} with result: ${depositResult}`
          );
        }

    })
  }
}

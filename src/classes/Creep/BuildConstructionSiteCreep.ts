import { BaseCreep } from "classes/BaseCreep";
import { findPath } from "common/findPath";

export class BuildConstructionSiteCreep extends BaseCreep {
  public constructor(creep: Creep) {
    super(creep);
    this.runCreep(creep);
  }
  private runCreep(creep: Creep) {
    this.checkIfFull(creep, RESOURCE_ENERGY);
    if (creep.memory.status === "working") {
      const constructionSites = Object.entries(Memory.rooms[creep.memory.room].monitoring.constructionSites).sort(
        ([, constructionSiteMemoryA], [, constructionSiteMemoryB]) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return
          constructionSiteMemoryA.progress + constructionSiteMemoryB.progress
      );
      if (constructionSites[0]) {
        const constructionSiteId = constructionSites[0][0] as Id<ConstructionSite>;
        if (constructionSiteId) {
          const constructionSite: ConstructionSite | null = Game.getObjectById(constructionSiteId);
          if (constructionSite) {
            const buildResult = this.buildConstructionSite(creep, constructionSite);
          } else {
            this.moveCreep(creep, findPath.findClearTerrain(creep.memory.room));
          }
        }
      }
    } else if (creep.memory.status === "fetchingResource") {
      this.fetchSource(creep);
    }
  }
  private buildConstructionSite(creep: Creep, constructionSite: ConstructionSite): ScreepsReturnCode {
    const upgradeResult: ScreepsReturnCode = creep.build(constructionSite);
    if (upgradeResult === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveCreep(creep, constructionSite.pos);
      return moveResult;
    } else {
      return upgradeResult;
    }
  }
}

import { CreepMemoryTemplate, CreepTemplate } from "./CreepTemplate";

interface BuildCreepMemory extends CreepMemoryTemplate {
  assignedRoom: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CreepMemory extends Partial<BuildCreepMemory> {}
}

export class BuildCreep extends CreepTemplate {
    public static bodyPartRatio = { work: 1, carry: 1, move: 1.5 }
    public constructor() {
        super();

        Object.values(Game.creeps)
            .filter(creep => creep.memory.type === "BuildCreep")
            .forEach(buildCreep => {
                if (buildCreep.memory.curTask === "spawning" && buildCreep.spawning === false) {
                    buildCreep.memory.curTask = "fetchingEnergy";
                }

                if (buildCreep.memory.curTask === "fetchingEnergy") {
                    if (buildCreep.store[RESOURCE_ENERGY] >= buildCreep.store.getCapacity(RESOURCE_ENERGY)) {
                        buildCreep.memory.curTask = "constructingSite";
                    }
                } else {
                    if (buildCreep.store[RESOURCE_ENERGY] === 0) {
                        buildCreep.memory.curTask = "fetchingEnergy";
                    }
                }

                switch (buildCreep.memory.curTask) {
                    case "fetchingEnergy":
                        buildCreep.fetchEnergy();
                        break;
                    case "constructingSite":
                        this.constructSite(buildCreep);
                        break;
                }
            });
    }

    private constructSite(buildCreep: Creep) {
        const constructionSiteMatrix = Memory.rooms[buildCreep.memory.assignedRoom!].constructionSites;
        if (constructionSiteMatrix) {
            if (Object.keys(constructionSiteMatrix).length > 0) {
                const constructionSiteDistanceMatrix = Object.entries(constructionSiteMatrix).map(
                    ([constructionSiteId, constructionSiteMemory]) => {
                        return {
                            id: constructionSiteId,
                            progress: constructionSiteMemory.progress.total / constructionSiteMemory.progress.progress,
                            distance: buildCreep.pos.getRangeTo(constructionSiteMemory.pos.x, constructionSiteMemory.pos.y)
                        };
                    }
                )

                const closestConstructionSiteId = constructionSiteDistanceMatrix.sort(
                    (constructionSiteA, constructionSiteB) => constructionSiteA.distance - constructionSiteB.distance
                )[0].id as Id<ConstructionSite>;
                const closestConstructionSite = Game.getObjectById(closestConstructionSiteId);
                if (closestConstructionSite) {
                    const buildResult = buildCreep.build(closestConstructionSite);

                    // console.log(`${this.name}`)
                    if (buildResult === ERR_NOT_IN_RANGE) {
                        const moveResult = buildCreep.moveTo(closestConstructionSite);
                        return moveResult;
                    }
                } else return ERR_INVALID_TARGET;
            }
            return ERR_NOT_FOUND;
        }
        return ERR_INVALID_TARGET;
    }
}


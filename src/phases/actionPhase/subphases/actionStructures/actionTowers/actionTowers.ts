export function actionTowers(roomName: string) {
    const towers: StructureTower[] = []
    Object.keys(Memory.rooms[roomName].monitoring.structures.towers).forEach(towerId => {
        const tower = Game.getObjectById(towerId as Id<StructureTower>)
        if (tower) {
            towers.push(tower)
        }
    })
    const hostilesInRoom: Creep[] = []
    Object.keys(Memory.rooms[roomName].monitoring.hostiles).forEach(hostileId => {
        const hostile = Game.getObjectById(hostileId as Id<Creep>)
        if (hostile) {
            hostilesInRoom.push(hostile)
        }
    })

    if (hostilesInRoom.length > 0) {
        let target = hostilesInRoom[0]

        const hostilesWithHeal = hostilesInRoom.filter(hostile => {
            return hostile.getActiveBodyparts(HEAL) > 0
        })

        if(hostilesWithHeal.length > 0) {
            target = hostilesWithHeal[0]
        }

        towers.forEach(tower => {
            if(target) {
                tower.attack(target)
            }
        })
    }

    const roadsInDisrepair: StructureRoad[] = []
    const containersInDisrepair: StructureContainer[] = []
    const structuresInDisrepair = [...roadsInDisrepair, ...containersInDisrepair]

    if(structuresInDisrepair.length > 0){
        towers.forEach(tower => {
            const target = structuresInDisrepair.sort((structureA, structureB) => (structureA.hits / structureA.hitsMax) - (structureB.hits / structureB.hitsMax))[0]
            tower.repair(target)
        })
    }
}

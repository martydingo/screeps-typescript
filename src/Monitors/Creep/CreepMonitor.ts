

// declare global {
//     export interface CreepMemory {
//         class: string
//         hits: {
//             amount: number
//             capacity: number
//         }
//     }
// }

export class CreepMonitor {
    public constructor() {
        this.clearCreepMemory()
    }

    private clearCreepMemory() {
        Object.keys(Memory.creeps).forEach((creepId) => Game.creeps[creepId] === undefined && delete Memory.creeps[creepId])
    }


}

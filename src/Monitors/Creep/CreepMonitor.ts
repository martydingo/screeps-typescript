

// declare global {
//     export interface CreepMemory {
//         class: string
//         hits: {
//             amount: number
//             capacity: number
//         }
//     }
// }

// )@profileClass()
export class CreepMonitor {
    public static run() {
        this.clearCreepMemory()
    }

    // )@profileMethod
private static clearCreepMemory() {
        Object.keys(Memory.creeps).forEach((creepId) => Game.creeps[creepId] === undefined && delete Memory.creeps[creepId])
    }


}

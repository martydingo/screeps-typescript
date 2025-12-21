export interface RoadMonitorMemory {
  [key: string]: {
    hits: {
      current: number
      total: number
    }
    pos: RoomPosition
  };
}

export class RoadMonitor {
  public constructor(road: StructureRoad) {
    if (!road.room.memory.structures!.roads) {
      road.room.memory.structures!.roads = {};
    }
    road.room.memory.structures!.roads[road.id] = {
      hits: {
        current: road.hits,
        total: road.hitsMax
      },
      pos: road.pos
    };
  }
}

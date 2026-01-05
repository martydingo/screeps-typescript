export interface RoomPathCache {
  exits: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

declare global {
  interface Memory {
    pathCache: {
      [key: string]: RoomPathCache;
    };
  }
}

type StructureMonitorTypes = "containers";

export const Pathfinding = {
  routeCallback: (roomName: string, fromRoomName: string) => {
    const avoidanceFlags = Object.values(Game.flags)
      .filter(flag => flag.name.includes("avoid"))
      .map(avoidanceFlag => avoidanceFlag.pos.roomName);
    if (avoidanceFlags.includes(roomName)) {
      return Infinity;
    }
    return 1;
  },

  routeToRoom: (originRoomName: string, destinationRoomName: string) => {
    const route = Game.map.findRoute(originRoomName, destinationRoomName, {
      routeCallback: Pathfinding.routeCallback
    });
    return route;
    // const route = Game.map.findRoute("E12S17", "E14S18", { routeCallback: Pathfinding.routeCallback});

    //
  },

  lookAround: (
    originPos: RoomPosition,
    structureMonitorType: StructureMonitorTypes,
    range: number
  ): Structure<StructureConstant> | null => {
    const roomMemory = Memory.rooms[originPos.roomName];
    if (roomMemory) {
      const structureMonitorMemory = roomMemory.structures;
      if (structureMonitorMemory) {
        const targetMonitorMemory = structureMonitorMemory[structureMonitorType];
        if (targetMonitorMemory) {
          let targetStructure = null;
          Object.keys(targetMonitorMemory).forEach(structureId => {
            const workingStructure = Game.getObjectById(structureId as Id<Structure>);
            if (workingStructure) {
              const structurePos = {
                x: workingStructure.pos.x,
                y: workingStructure.pos.y
              };

              const posDifferences = {
                x:
                  (originPos.x - structurePos.x > 0 && originPos.x - structurePos.x) ||
                  (originPos.x - structurePos.x) * -1,
                y:
                  (originPos.y - structurePos.y > 0 && originPos.y - structurePos.y) ||
                  (originPos.y - structurePos.y) * -1
              };

              const posinRange = posDifferences.x <= range && posDifferences.y <= range;
              if (posinRange) {
                targetStructure = workingStructure;
              }
            }
          });
          return targetStructure;
        } else return null;
      } else return null;
    }
    return null;
  },

  cacheExit: (
    origin: RoomPosition,
    destinationRoom: string,
    path: PathStep[]
  ) => {
    const serializedPath = Room.serializePath(path);
    if (serializedPath !== "") {
      if (!Memory.pathCache) {
        Memory.pathCache = {};
      }

      if (!Memory.pathCache[origin.roomName]) {
        Memory.pathCache[origin.roomName] = {
          exits: {}
        };
      }
      if (!Memory.pathCache[origin.roomName].exits[destinationRoom]) {
        Memory.pathCache[origin.roomName].exits[destinationRoom] = {};
      }

      if (
        !Memory.pathCache[origin.roomName].exits[destinationRoom][
          `${origin.x}-${origin.y}`
        ]
      ) {
        Memory.pathCache[origin.roomName].exits[destinationRoom][
          `${origin.x}-${origin.y}`
        ] = serializedPath;
      }
    }

    // if (!Memory.pathCache[origin.roomName][`${destination.x}-${destination.y}`]) {
    //   Memory.pathCache[origin.roomName][`${destination.x}-${destination.y}`].exits = {
    //     path: Room.serializePath(path)
    //   };
    // }
  }
};

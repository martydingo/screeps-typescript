// import { profileClass, profileMethod } from "utils/Profiler";
import { Log, LogSeverity } from "utils/log";
import { config } from "../../config";
import { ConstructionSiteMonitor } from "./ConstructionSiteMonitor";
import { ControllerMonitor } from "./ControllerMonitor";
import { HostileMonitor } from "./HostileMonitor";
import { ResourceMonitor } from "./ResourceMonitor";
import { SourceMonitor } from "./SourceMonitor";
import { TombstoneMonitor } from "./TombstoneMonitor";

interface RoomMonitorMemory {
  amount: number;
  capacity: number;
}

declare global {
  interface RoomMemory {
    energy?: RoomMonitorMemory;
  }
}

// )@profileClass()
export class RoomMonitor {
  public static run() {
    let rooms: string[] = [];
    if (!Memory.rooms) {
      Memory.rooms = {};
      Log(
        LogSeverity.DEBUG,
        "RoomMonitor",
        `Room memory not found, room monitor memory initialised.`
      );
    }

    rooms = [...Object.keys(Game.rooms), ...config[Memory.env].roomsToMine];
    Log(LogSeverity.DEBUG, "RoomMonitor", `Rooms to be monitored: ${rooms.join(" ")}`);

    rooms.forEach(roomName => {
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {};
        Log(
          LogSeverity.DEBUG,
          "RoomMonitor",
          `${roomName} memory not found, ${roomName} memory initialized.`
        );
      }
      RoomMonitor.monitorRoom(roomName);
      Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} monitors executed.`);
    });
  }

  // )@profileMethod
  private static monitorRoom(roomName: string) {
    if (Game.rooms[roomName]) {
      Memory.rooms[roomName].energy = {
        amount: Game.rooms[roomName].energyAvailable,
        capacity: Game.rooms[roomName].energyCapacityAvailable
      };
    }
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} spawn energy levels recorded.`);
    SourceMonitor.run(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} sources monitor initialised.`);
    ControllerMonitor.run(roomName);
    Log(
      LogSeverity.DEBUG,
      "RoomMonitor",
      `${roomName} controller monitor initialised.`
    );
    ResourceMonitor.run(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} resource monitor initialised.`);
    ConstructionSiteMonitor.run(roomName);
    Log(
      LogSeverity.DEBUG,
      "RoomMonitor",
      `${roomName} construction site monitor initialised.`
    );
    TombstoneMonitor.run(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} tombstone monitor initialised.`);
    HostileMonitor.run(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} hostile monitor initialised.`);
  }
}

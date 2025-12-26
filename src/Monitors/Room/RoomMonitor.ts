import { Log, LogSeverity } from "utils/log";
import { config } from "../../config";
import { ConstructionSiteMonitor } from "./ConstructionSiteMonitor";
import { ControllerMonitor } from "./ControllerMonitor";
import { HostileMonitor } from "./HostileMonitor";
import { ResourceMonitor } from "./ResourceMonitor";
import { SourceMonitor } from "./SourceMonitor";

interface RoomMonitorMemory {
  amount: number;
  capacity: number;
}

declare global {
  interface RoomMemory {
    energy?: RoomMonitorMemory;
  }
}

export class RoomMonitor {
  private rooms: string[];
  public constructor() {
    if (!Memory.rooms) {
      Memory.rooms = {};
      Log(LogSeverity.DEBUG, "RoomMonitor", `Room memory not found, room monitor memory initialised.`);
    }

    this.rooms = [...Object.keys(Game.rooms), ...config.roomsToMine[Memory.env]];
    Log(LogSeverity.DEBUG, "RoomMonitor", `Rooms to be monitored: ${this.rooms.join(" ")}`);

    this.rooms.forEach(roomName => {
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {};
        Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} memory not found, ${roomName} memory initialized.`);
      }
      this.monitorRoom(roomName);
      Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} monitors executed.`);
    });
  }

  private monitorRoom(roomName: string) {
    if (Game.rooms[roomName]) {
      Memory.rooms[roomName].energy = {
        amount: Game.rooms[roomName].energyAvailable,
        capacity: Game.rooms[roomName].energyCapacityAvailable
      };
    }
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} spawn energy levels recorded.`);

    new SourceMonitor(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} sources monitor initialised.`);
    new ControllerMonitor(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} controller monitor initialised.`);
    new ResourceMonitor(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} resource monitor initialised.`);
    new ConstructionSiteMonitor(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} construction site monitor initialised.`);
    new HostileMonitor(roomName);
    Log(LogSeverity.DEBUG, "RoomMonitor", `${roomName} hostile monitor initialised.`);
  }
}

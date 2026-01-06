import { profileClass, profileMethod } from "utils/Profiler";

import { LabConfig, config } from "config";


export class TerminalDaemon {
  @profileClass("TerminalDaemon")
  public static run() {
    const roomNameLabConfigs: [string, LabConfig][] = [];
    const labConfigs = config[global.store.env].labConfig;
    Object.entries(labConfigs).forEach(([roomName, labConfig]) => {
      labConfig.forEach(roomLabConfig => {
        if (roomLabConfig.labs.primary.boost) {
          roomNameLabConfigs.push([roomName, roomLabConfig]);
        }
      });
    });

    roomNameLabConfigs.forEach(roomNameLabConfig => {
      TerminalDaemon.manageTerminal(roomNameLabConfig);
    });
  }

  private static manageTerminal(roomNameLabConfig: [string, LabConfig]) {
    const [roomName, roomLabConfig] = roomNameLabConfig;
    const room = Game.rooms[roomName];
    if (room) {
      const terminal = room.terminal;
      const storage = room.storage;
      if (terminal && storage) {
        const resourceType = roomLabConfig.recipe;
        const threshold = 12000;
        if (
          terminal.store[resourceType] < threshold &&
          storage.store[resourceType] < threshold
        ) {
          if (terminal.cooldown === 0) {
            TerminalDaemon.orderResource(roomName, resourceType);
          }
        }
      }
    }
  }
  @profileMethod
  private static orderResource(roomName: string, resourceType: ResourceConstant) {
    const orders = Game.market
      .getAllOrders(
        order => order.type === ORDER_SELL && order.resourceType === resourceType
      )
      .map(order => {
        return {
          ...order,
          transferPrice: Game.market.calcTransactionCost(
            order.amount,
            order.roomName!,
            roomName
          )
        };
      })
      .filter(
        order =>
          order.transferPrice < 2000 && order.amount >= 3000 && order.price < 2000
      )
      .sort((orderA, orderB) => orderA.price - orderB.price);
    Game.market.deal(orders[0].id, 3000, roomName);
  }
}

import { profileClass } from "utils/Profiler";

@profileClass()
export class TerminalDaemon {
  public constructor() {
    this.manageXGH2O();
  }

  private manageXGH2O() {
    const orders = Game.market
      .getAllOrders(
        order =>
          order.type === ORDER_SELL &&
          order.resourceType === RESOURCE_CATALYZED_GHODIUM_ACID
      )
      .map(order => {

          return { ...order, transferPrice: Game.market.calcTransactionCost(order.amount, order.roomName!, "E12S16") };

        })
        .sort((orderA, orderB) => orderA.transferPrice - orderB.transferPrice)
        // console.log(JSON.stringify(orders))
  }
}

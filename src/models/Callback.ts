import { Player } from "@minecraft/server";

export class CommandCallback {
  /**
   * Returns a commands callback
   * @param data chat data that was used
   */
  constructor(public sender: Player) {
    this.sender = sender;
  }
}

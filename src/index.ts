import { Player, system, world } from "@minecraft/server";
import { COMMANDS } from "./commands";
import { PREFIX } from "./config/commands";
import type { Command } from "./models/Command";
import {
  commandNotFound,
  commandSyntaxFail,
  getChatAugments,
  noPerm,
  sendCallback,
} from "./utils";

import type { Command } from "./models/Command";
import type { Player} from "@minecraft/server";

// Load the test commands, after the COMMANDS array is initialized
import("./tests/import");

function executeCommand(command: Command, sender: Player, args: string[]) {
  if (!command.data.requires?.(sender)) return noPerm(sender, command);
  if (command.data.cooldown) {
    // TODO: Implement cooldown with player dynamic properties
  }
  const verifiedCommands: Command[] = [];
  /**
   * Checks all arguments to test validity
   * @param start start command to look at
   * @param i index of the argument in base command
   * @returns If a augmented failed
   */
  const getArg = (start: Command<any>, i: number): "fail" | undefined => {
    if (start.children.length == 0) return undefined;
    const arg = args[i];
    if (!arg && start.callback) return undefined;
    if (!arg) return commandSyntaxFail(sender, command, start, args, i), "fail";
    const matchedArg = start.children.find((v) => v.type.matches(arg).success);
    if (!matchedArg && start.callback) return undefined;
    if (!matchedArg)
      return commandSyntaxFail(sender, command, start, args, i), "fail";
    if (!matchedArg.data.requires?.(sender))
      return noPerm(sender, matchedArg), "fail";
    verifiedCommands.push(matchedArg);
    return getArg(matchedArg, i + 1);
  };
  let v = getArg(command, 0);
  if (v == "fail") return;
  system.run(async () => {
    if (!sender.isValid) return;
    try {
      await sendCallback(args, verifiedCommands, sender, command);
    } catch (error) {
      console.error(error);
    }
  });
}

world.beforeEvents.chatSend.subscribe((data) => {
  if (!data.message.startsWith(PREFIX)) return; // This is not a command
  data.cancel = true;
  const args = getChatAugments(data.message, PREFIX);
  const commandName = args.shift();
  if (!commandName) return;
  const command = COMMANDS.find(
    (c) =>
      c.depth == 0 &&
      (c.data.name === commandName || c.data.aliases?.includes(commandName))
  );
  if (!command) return commandNotFound(data.sender, commandName);
  executeCommand(command, data.sender, args);
});

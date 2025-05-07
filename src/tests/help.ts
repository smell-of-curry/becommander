import { COMMANDS } from "../commands";
import { PREFIX } from "../config/commands";
import { Command } from "../models/Command";

import type { IArgumentReturnData, IArgumentType } from "../models/ArgumentTypes";
import type { Player } from "@minecraft/server";

/**
 * An argument type that matches a command name
 */
export class CommandNameArgumentType implements IArgumentType {
  type!: string;
  typeName = "CommandName";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: Boolean(COMMANDS.find((c) => c.depth == 0 && c.data.name == value)),
      value: value,
    };
  }
  fail(value: string): string {
    return `${value} should be a command name!`;
  }
  constructor(public name: string) {}
}

/**
 * Send the arguments to the player
 * @param baseCommand - The base command
 * @param command - The command to send the arguments to
 * @param args - The arguments to send
 * @param player - The player to send the arguments to
 */
function sendArguments<T, U>(baseCommand: Command<T>, command: Command<U>, args: Command<unknown>[], player: Player) {
  if (!command.data.requires?.(player)) return;
  const fullArgs = command.depth == 0 ? args : args.concat(command);
  if (command.callback)
    player.sendMessage(
      `${PREFIX}${baseCommand.data.name} ${fullArgs
        .filter((a) => !a.type.name.match(/_[yxz]\*/))
        .map((a) => (a.type.typeName == "literal" ? a.data.name : `<${a.type.name}: ${a.type.typeName}>`))
        .filter((a) => a)
        .join(" ")}`
    );
  if (command.children.length == 0) return;
  for (const child of command.children) {
    sendArguments(baseCommand, child, fullArgs, player);
  }
}

/**
 * Send the page header to the player
 * @param player - The player to send the page header to
 * @param page - The page number
 * @param maxPages - The maximum number of pages
 */
function sendPageHeader(player: Player, page: number, maxPages: number) {
  player.sendMessage(`§2--- Showing help page ${page} of ${maxPages} (${PREFIX}help <page: int>) ---`);
}

/**
 * Send the command header to the player
 * @param player - The player to send the command header to
 * @param command - The command to send the header of
 */
function sendCommandHeader(player: Player, command: Command<unknown>) {
  player.sendMessage(
    `§e${command.data.name} ${command.data.aliases ? `(also ${command.data.aliases.join(", ")})` : ""}\n${
      command.data.description
    }\n§rUsage:`
  );
}

/**
 * Get the maximum number of pages for the help command
 * @param player - The player to get the maximum number of pages for
 * @returns The maximum number of pages
 */
function getMaxPages(player: Player): number {
  const cmds = COMMANDS.filter((c) => c.depth == 0 && c.data?.requires?.(player));
  if (cmds.length == 0) return 0;
  return Math.ceil(cmds.length / 5);
}

const root = new Command({
  name: "help",
  description: "Provides help/list of commands.",
  aliases: ["?", "h"],
}).executes((ctx) => {
  const maxPages = getMaxPages(ctx.sender);
  const cmds = COMMANDS.filter((c) => c.depth == 0 && c.data.requires?.(ctx.sender)).slice(1 * 5 - 5, 1 * 5);

  // Send page details
  sendPageHeader(ctx.sender, 1, maxPages);
  for (const cmd of cmds) sendArguments(cmd, cmd, [], ctx.sender);
});

root.int("page").executes((ctx, p) => {
  // Validate page number
  if (p < 1) p = 1;
  const maxPages = getMaxPages(ctx.sender);
  if (p > maxPages) p = maxPages;

  // Get commands for this page
  const cmds = COMMANDS.filter((c) => c.depth == 0 && c.data?.requires?.(ctx.sender)).slice(p * 5 - 5, p * 5);
  sendPageHeader(ctx.sender, p, maxPages);
  for (const cmd of cmds) sendArguments(cmd, cmd, [], ctx.sender);
});

root.argument(new CommandNameArgumentType("command")).executes((ctx, command) => {
  const cmd = COMMANDS.filter((c) => c.depth == 0 && c.data.name == command)[0];
  if (!cmd) return ctx.sender.sendMessage(`§cCommand not found!`);
  sendCommandHeader(ctx.sender, cmd);
  sendArguments(cmd, cmd, [], ctx.sender);
});

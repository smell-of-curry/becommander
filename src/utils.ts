import { Entity, Player, Vector3, world } from "@minecraft/server";
import { PREFIX } from "./config/commands";
import { LiteralArgumentType, LocationArgumentType } from "./models/ArgumentTypes";
import { CommandCallback } from "./models/Callback";
import type { Command } from "./models/Command";

/**
 * Returns a Before chat events augments
 * @example this.getChatAugments(BeforeChatEvent)
 */
export function getChatAugments(
  message: string,
  prefix: string
): Array<string> {
  const match = message
    .slice(prefix.length)
    .trim()
    .match(/"[^"]+"|[^\s]+/g);
  if (!match) return [];
  return match.map((e) => e.replace(/"(.+)"/, "$1").toString());
}

/**
 * Sends a command not found message to a player
 * @param player player to send message to
 */
export function commandNotFound(player: Player, command: string) {
  player.sendMessage({
    rawtext: [
      {
        text: `§c`,
      },
      {
        translate: `commands.generic.unknown`,
        with: [`${command}`],
      },
    ],
  });
}

/**
 * Sends a command not found message to a player
 * @param player player to send message to
 */
export function noPerm(player: Player, command: Command) {
  player.sendMessage(
    command.data.invalidPermission
      ? command.data.invalidPermission
      : `§cYou do not have permission to use "${command.data.name}"`
  );
}

/**
 * Sends a syntax failure message to player
 * @param player
 * @param command
 * @param args
 * @param i
 */
export function commandSyntaxFail(
  player: Player,
  baseCommand: Command,
  command: Command,
  args: string[],
  i: number
) {
  player.sendMessage({
    rawtext: [
      {
        text: `§c`,
      },
      {
        translate: `commands.generic.syntax`,
        with: [
          `${PREFIX}${baseCommand.data.name} ${args.slice(0, i).join(" ")}`,
          args[i] ?? " ",
          args.slice(i + 1).join(" "),
        ],
      },
    ],
  });
  if (command.children.length > 1 || !args[i]) {
    // this type could be many things
    const types = command.children.map((c) =>
      c.type instanceof LiteralArgumentType ? c.type.name : c.type.typeName
    );
    player.sendMessage(
      `§c"${args[i] ?? "undefined"}" is not valid! Argument "${
        [...new Set(command.children.map((c) => c.type.name))][0]
      }" can be typeof: "${types.join('", "')}"`
    );
  } else {
    player.sendMessage(
      `§c${command.children[0]?.type.fail(args[i] ?? "undefined")}`
    );
  }
}

/**
 * Returns a location of the inputted argument
 * @example parseLocationArgs(["~1", "3", "^7"], { location: [1,2,3] , viewVector: [1,2,3] })
 */
export function parseLocationArgs(
  [x, y, z]: [x: string, y: string, z: string],
  entity: Entity
): Vector3 | null {
  if (!entity.isValid) return null;
  if (!x || !y || !x) return null;
  const viewDirection = entity.getViewDirection();
  const locations = [entity.location.x, entity.location.y, entity.location.z];
  const viewVectors = [viewDirection.x, viewDirection.y, viewDirection.z];
  const a = [x, y, z].map((arg) => {
    const r = parseFloat(arg);
    return isNaN(r) ? 0 : r;
  });
  const b = [x, y, z].map((arg, index) => {
    const val = a[index] as number;
    return arg.includes("~")
      ? (val as number) + (locations[index] as number)
      : arg.includes("^")
      ? val + (viewVectors[index] as number)
      : val;
  });
  return { x: b[0] as number, y: b[1] as number, z: b[2] as number };
}

/**
 * Converts an Error object into a string representation.
 * @param err - The Error object to stringify.
 * @param replacer - A function that transforms the results.
 * @param space - The number of spaces to use for indentation.
 * @returns A string representation of the Error object.
 */
export function stringifyError(
  err: Error,
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2]
) {
  try {
    var plainObject = {};
    Object.getOwnPropertyNames(err).forEach(function (key) {
      plainObject[key] = err[key as keyof Error];
    });
    return JSON.stringify(plainObject, replacer, space);
  } catch (error) {
    console.error(
      `Failed to stringify error: ${error}, typeof: ${typeof err}, ${err}`
    );
    try {
      return JSON.stringify(err);
    } catch (error) {
      return `${err}`;
    }
  }
}

/**
 * Sends a callback back to the command
 * @param cmdArgs the args that the command used
 * @param args args to use
 */
export async function sendCallback(
  cmdArgs: string[],
  args: Command<any>[],
  sender: Player,
  baseCommand: Command<any>
) {
  const lastArg = args[args.length - 1] ?? baseCommand;
  const argsToReturn: any[] = [];
  for (const [i, arg] of args.entries()) {
    if (arg.type.name.endsWith("*")) continue;
    if (arg.type instanceof LocationArgumentType) {
      argsToReturn.push(
        parseLocationArgs(
          [cmdArgs[i] ?? "", cmdArgs[i + 1] ?? "", cmdArgs[i + 2] ?? ""],
          sender
        )
      );
      continue;
    }
    if (arg.type instanceof LiteralArgumentType) continue;
    argsToReturn.push(arg.type.matches(cmdArgs[i] ?? "").value ?? cmdArgs[i]);
  }
  try {
    const res = await lastArg.callback(
      new CommandCallback(sender),
      ...argsToReturn
    );
    if (res == "fail") return;
    if (baseCommand.data.cooldown) {
      // TODO: Implement cooldown with player dynamic properties
    }
  } catch (error) {
    console.error(error);
    sender.sendMessage(
      `§cAn error occurred while executing this command, ${stringifyError(
        error as Error
      )}`
    );
  }
}

/**
 * Fetch an online players data
 */
export function fetchPlayerFromName(playerName: string): Player | undefined {
  return [...world.getPlayers()].find((player) => player.name === playerName);
}

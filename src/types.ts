import type { Player } from "@minecraft/server";
import type { Command } from "./models/Command";
import type { CommandCallback } from "./models/Callback";

export interface ICommandData {
  /**
   * The name of the command
   * @example "ban"
   */
  name: string;
  /**
   * How this command works
   * @example "Bans a player"
   */
  description: string;
  /**
   * Other names that can call this command
   * @example ```["f", "s"]```
   * @example ```["f"]```
   */
  aliases?: string[];
  /**
   * A function that will determine if a player has permission to use this command
   * @param player this will return the player that uses this command
   * @returns if this player has permission to use this command
   * @example ```
   * (player) => player.hasTag("admin")
   * ```
   */
  requires?: (player: Player) => boolean;
  /**
   * A meta data type for the command parser to restrict this command from viewing
   * unless your OP
   *
   * YOU STILL NEED TO USE {@link requires}!
   */
  requiresOP?: boolean;
  /**
   * The message that will be send if a player doest have permission to use this command
   * Its good to explain why this failed here
   * @example "You can only run this command in the overworld"
   * @example "You are not a admin"
   * @example "You have failed to meet the required parameters for this command"
   */
  invalidPermission?: string;
  /**
   * The cooldown of this command in milliseconds.
   * @example 1000
   * @example 10000
   * @example 283283
   */
  cooldown?: number;
}

export type AppendArgument<Base, Next> = Base extends (
  ctx: infer X,
  ...args: infer E
) => infer R
  ? (ctx: X, ...args: [...E, Next]) => R
  : never;

export type ArgReturn<Callback extends any, type extends any> = Command<
  AppendArgument<Callback, type>
>;

/**
 * Utility type that generates a sequence of numbers from 0 to N-1
 */
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

/**
 * Utility type representing a range of numbers from F to T inclusive
 */
export type Range<F extends number, T extends number> =
  | Exclude<Enumerate<T>, Enumerate<F>>
  | T;

export type DefaultCommandCallback = (
  ctx: CommandCallback
) => void | "fail" | Promise<void | "fail">;

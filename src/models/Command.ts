import { Player, Vector3 } from "@minecraft/server";
import {
  LiteralArgumentType,
  IArgumentType,
  LocationArgumentType,
  StringArgumentType,
  IntegerArgumentType,
  ArrayArgumentType,
  BooleanArgumentType,
  PlayerArgumentType,
} from "./ArgumentTypes";
import { COMMANDS } from "../index";
import type {
  AppendArgument,
  ICommandData,
  ArgReturn,
  Range,
  DefaultCommandCallback,
} from "../types";
export { ArgumentTypes } from "./ArgumentTypes";

export class Command<Callback extends Function = DefaultCommandCallback> {
  /**
   * The Arguments on this command
   */
  children: Command<any>[];

  /**
   * Function to run when this command is called
   */
  callback?: Callback;

  constructor(
    public data: ICommandData,
    public type: IArgumentType = new LiteralArgumentType(data.name),
    public depth: number = 0,
    public parent?: Command<any>
  ) {
    if (!data.requires) data.requires = () => true;
    this.data = data;
    this.type = type;
    this.children = [];
    this.depth = depth;
    this.parent = parent;

    COMMANDS.push(this);
  }

  /**
   * Adds a ranch to this command of your own type
   * @param type a special type to be added
   * @returns new branch to this command
   */
  argument<T extends IArgumentType>(type: T): ArgReturn<Callback, T["type"]> {
    const cmd = new Command<AppendArgument<Callback, T["type"]>>(
      this.data,
      type,
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }

  /**
   * Adds a branch to this command of type Player
   * @param name name this argument should have
   * @returns new branch to this command
   */
  player(name: string): ArgReturn<Callback, Player> {
    return this.argument(new PlayerArgumentType(name));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  string(name: string): ArgReturn<Callback, string> {
    return this.argument(new StringArgumentType(name));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  int<R1 extends number, R2 extends number, R extends Range<R1, R2>>(
    name: string,
    range?: [R1, R2]
  ): ArgReturn<Callback, R> {
    return this.argument(new IntegerArgumentType(name, range));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  array<const T extends Array<string>>(
    name: string,
    types: T
  ): ArgReturn<Callback, T[number]> {
    return this.argument(new ArrayArgumentType(name, types));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  boolean(name: string): ArgReturn<Callback, boolean> {
    return this.argument(new BooleanArgumentType(name));
  }

  /**
   * Adds a argument to this command to add 3 parameters with location types and to return a Location
   * @param name name this argument  should have
   * @returns new branch to this command
   */
  location(name: string): ArgReturn<Callback, Vector3> {
    const cmd = this.argument(new LocationArgumentType(name));
    if (!name.endsWith("*")) {
      const newArg = cmd.location(name + "_y*").location(name + "_z*");
      return newArg as any as ArgReturn<Callback, Vector3>;
    }
    return cmd as any as ArgReturn<Callback, Vector3>;
  }

  /**
   * Adds a subCommand to this argument
   * @param name name this literal should have
   * @returns new branch to this command
   */
  literal(data: ICommandData): Command<Callback> {
    const cmd = new Command<Callback>(
      data,
      new LiteralArgumentType(data.name),
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }

  /**
   * Registers this command and its appending arguments
   * @param callback what to run when this command gets called
   */
  executes(callback: Callback): Command<Callback> {
    this.callback = callback;
    return this;
  }
}

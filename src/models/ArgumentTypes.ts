import { Player } from "@minecraft/server";
import { fetchPlayerFromName } from "../utils";

export interface IArgumentReturnData<T> {
  /**
   * If this argument matches the value
   */
  success: boolean;
  /**
   * The parsed value that should be passed in command callback
   * if there is no return type this will be null
   */
  value?: T;
}

export abstract class IArgumentType {
  /**
   * The return type
   */
  type: any;
  /**
   * The name that the help for this command will see
   * @example "string"
   * @example "Location"
   * @example "int"
   * @example "number"
   * @example "UnitType"
   */
  typeName: string = "";
  /**
   * The name this argument is
   */
  name: string = "name";
  /**
   * Checks if a value matches this argument type, also
   * returns the corresponding type
   */
  matches(_value: string): IArgumentReturnData<any> {
    return { success: true };
  }
  /**
   * the fail message that should be sent if player fails to meet the matches criteria
   * @param _value value that was sent
   * @returns what would happen if you didn't enter the right value
   */
  fail(_value: string): string {
    return `Value must be of type string!`;
  }
  constructor(_name: string = "any") {}
}

export class LiteralArgumentType implements IArgumentType {
  type!: null;
  typeName = "literal";
  matches(value: string): IArgumentReturnData<null> {
    return {
      success: this.name == value,
    };
  }
  fail(value: string): string {
    return `${value} should be ${this.name}!`;
  }
  constructor(public name: string = "literal") {
    this.name = name;
  }
}

export class StringArgumentType implements IArgumentType {
  type!: string;
  typeName = "string";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: Boolean(value && value != ""),
      value: value,
    };
  }
  fail(_value: string): string {
    return `Value must be of type string!`;
  }
  constructor(public name: string = "string") {
    this.name = name;
  }
}

export class IntegerArgumentType implements IArgumentType {
  type!: number;
  range?: [number, number];
  typeName = "int";

  /**
   * Checks if a number is between two other numbers.
   *
   * @param numberToCheck - The number to check.
   * @param range - An array of two numbers defining the range to check against.
   * @returns {boolean} - True if the number is between the two numbers in the range, false otherwise.
   */
  static isNumberInRange<T extends number>(
    numberToCheck: T,
    range: [T, T]
  ): boolean {
    return numberToCheck >= range[0] && numberToCheck <= range[1];
  }

  matches(value: string): IArgumentReturnData<number> {
    return {
      success: this.range
        ? IntegerArgumentType.isNumberInRange(parseInt(value), this.range)
        : !isNaN(Number(value)),
      value: parseInt(value),
    };
  }
  fail(_value: string): string {
    return `Value must be valid number!`;
  }
  constructor(public name: string = "integer", range?: [number, number]) {
    this.name = name;
    if (range) this.range = range;
  }
}

export class FloatArgumentType implements IArgumentType {
  type!: number;
  typeName = "float";
  matches(value: string): IArgumentReturnData<number> {
    return {
      success: Boolean(value?.match(/^\d+\.\d+$/)?.[0]),
      value: parseInt(value),
    };
  }
  fail(_value: string): string {
    return `Value must be valid float!`;
  }
  constructor(public name: string = "float") {
    this.name = name;
  }
}

export class LocationArgumentType implements IArgumentType {
  type!: string;
  typeName = "location";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: /^([~^]{0,1}(-\d)?(\d*)?(\.(\d+))?)$/.test(value),
      value: value,
    };
  }
  fail(_value: string): string {
    return `Value needs to be a valid number, value can include: [~,^]`;
  }
  constructor(public name: string = "location") {
    this.name = name;
  }
}

export class BooleanArgumentType implements IArgumentType {
  type!: boolean;
  typeName = "boolean";
  matches(value: string): IArgumentReturnData<boolean> {
    return {
      success: Boolean(value?.match(/^(true|false)$/)?.[0]),
      value: value == "true" ? true : false,
    };
  }
  fail(value: string): string {
    return `"${value}" can be either "true" or "false"`;
  }
  constructor(public name: string = "boolean") {
    this.name = name;
  }
}

export class PlayerArgumentType implements IArgumentType {
  type!: Player;
  typeName = "player";
  matches(value: string): IArgumentReturnData<Player> {
    const player = fetchPlayerFromName(value);
    return player
      ? { success: true, value: player }
      : { success: false };
  }
  fail(value: string): string {
    return `player: "${value}", is not in this world`;
  }
  constructor(public name: string = "player") {
    this.name = name;
  }
}

export class TargetArgumentType implements IArgumentType {
  type!: string;
  typeName = "target";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: Boolean(value?.match(/^(@.|"[\s\S]+")$/)?.[0]),
      value: value,
    };
  }
  fail(value: string): string {
    return `${value} is not a valid target`;
  }
  constructor(public name: string = "target") {
    this.name = name;
  }
}

export class ArrayArgumentType<T extends ReadonlyArray<string>>
  implements IArgumentType
{
  type!: T[number];
  typeName = "array";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: this.types.includes(value),
      value: value,
    };
  }
  fail(value: string): string {
    return `"${value}" must be one of these values: ${this.types.join(" | ")}`;
  }
  constructor(public name: string = "array", public types: T) {
    this.name = name;
    this.types = types;

    //this.typeName = types.join(" | ").replace(/(.{25})..+/, "$1...");
  }
}

export class DurationArgumentType implements IArgumentType {
  type!: string;
  typeName = "duration";
  matches(value: string): IArgumentReturnData<string> {
    return {
      success: /^(\d+[hdysmw],?)+$/.test(value),
      value: value,
    };
  }
  fail(value: string): string {
    return `"${value}" must be a value like "10d" or "3s" the first part is the length second is unit`;
  }
  constructor(public name: string) {}
}

export const ArgumentTypes = {
  string: StringArgumentType,
  int: IntegerArgumentType,
  float: FloatArgumentType,
  location: LocationArgumentType,
  boolean: BooleanArgumentType,
  player: PlayerArgumentType,
  target: TargetArgumentType,
  array: ArrayArgumentType,
  duration: DurationArgumentType,
};

# 🎮 BECommander

A powerful and flexible command framework for Minecraft Bedrock Edition scripting. BECommander makes it easy to create, register, and manage custom chat commands with advanced argument parsing and validation.

## ✨ Features

- 🚀 Simple API for creating and registering commands
- 🔍 Rich argument type system with validation
- 🌲 Command hierarchy with subcommands
- 🔐 Permission system for command access control
- 🏷️ Command aliases
- 📚 Built-in help system
- ⚙️ Automatic argument parsing and validation
- 🎯 Support for Minecraft's native locations, player selectors, and more

## 📥 Installation (through Rubedo)

1. Add to your Rubedo Dependencies:
```json
"rubedo_dependencies": [
    {
      "module_name": "smell-of-curry/becommander",
      "version": "latest"
    }
],
```

2. Run `rubedo install`

## 🚀 Quick Start

### 👋 Creating a Simple Command

```ts
import { Command } from "src/models/Command";

// Create a simple hello command
const helloCommand = new Command({
  name: "hello",
  description: "Says hello to you or a player",
  aliases: ["hi", "hey"],
});

// Provide callback when running `-hello`
helloCommand.executes((ctx) => {
  ctx.sender.sendMessage("Hello, " + ctx.sender.name + "!");
});

// Add an optional player argument: `-hello "Smell of curry"`
// The Player will be looked for on the world, and a Player type
// Will be passed to `target` in the callback.
helloCommand
  .player("target")
  .executes((ctx, target) => {
    ctx.sender.sendMessage("Hello, " + target.name + "!");
  });
```

## ⚙️ Configuration

### 💬 Command Prefix

You can customize the command prefix in the `src/config/commands.ts` file:

```typescript
export const PREFIX = "-"; // Change to your preferred prefix
```

## 🧩 Argument Types

BECommander provides a variety of built-in argument types for command parameters:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Any text string | `-command "Hello World"` |
| `int` | Integer number (optional range) | `-command 42` |
| `float` | Floating-point number | `-command 3.14` |
| `boolean` | True or false | `-command true` |
| `player` | Valid player name | `-command Steve` |
| `location` | Minecraft coordinates | `-command ~0 ~1 ~0` |
| `array` | One from a predefined set | `-command option1` |
| `target` | Minecraft target selector | `-command @a` |
| `duration` | Time value | `-command 10s` |

### 🔧 Using Argument Types

```typescript
// Command with integer argument
new Command({
  name: "count",
  description: "Counts to a number",
})
  .int("number", [1, 100]) // Range from 1 to 100
  .executes((ctx, num) => {
    ctx.sender.sendMessage(`Counting to ${num}...`);
    // Implementation here
  });

// Command with multiple arguments
new Command({
  name: "teleport",
  description: "Teleport a player to coordinates",
  aliases: ["tp"],
})
  .player("target")
  .location("position")
  .executes((ctx, player, position) => {
    player.teleport(position);
    ctx.sender.sendMessage(`Teleported ${player.name} to ${JSON.stringify(position)}`);
  });

// Command with array argument type
new Command({
  name: "gamemode",
  description: "Change a player's gamemode",
  aliases: ["gm"],
})
  .array("mode", ["survival", "creative", "adventure", "spectator"] as const)
  .executes((ctx, mode) => {
    // Change gamemode implementation
  })
  .player("target")
  .executes((ctx, mode, player) => {
    // Change other player's gamemode
  });
```

## 🏗️ Command Structure

### 🆕 Create a new command

```typescript
const myCommand = new Command({
  name: "mycommand",
  description: "Description of what the command does",
  aliases: ["mc", "mycmd"], // Optional aliases
  requires: (player) => player.hasTag("admin"), // Optional permission check
});
```

### ▶️ Execute a function

```typescript
myCommand.executes((ctx) => {
  // Command logic here
  ctx.sender.sendMessage("Command executed!");
});
```

### ➕ Add arguments

```typescript
myCommand
  .string("message")
  .executes((ctx, message) => {
    ctx.sender.sendMessage(`You said: ${message}`);
  });
```

### 🔄 Add subcommands

```typescript
const subCommand = myCommand.literal({
  name: "sub",
  description: "A subcommand",
});

subCommand.executes((ctx) => {
  ctx.sender.sendMessage("Subcommand executed!");
});
```

## 🛠️ Creating Custom Argument Types

You can create custom argument types by implementing the `IArgumentType` interface:

```typescript
import { IArgumentType, IArgumentReturnData } from "./models/ArgumentTypes";

export class CustomArgumentType implements IArgumentType {
  type!: string; // The return type
  typeName = "custom"; // Name for help text
  
  matches(value: string): IArgumentReturnData<string> {
    // Your validation logic here
    const isValid = true; // Replace with your validation
    
    return {
      success: isValid,
      value: value, // The parsed value to pass to the command
    };
  }
  
  fail(value: string): string {
    return `"${value}" is not a valid custom argument!`;
  }
  
  constructor(public name: string = "custom") {
    this.name = name;
  }
}
```

## 🔥 Advanced Usage

### ⏱️ Command Cooldowns

You can implement cooldowns using player dynamic properties:

```typescript
new Command({
  name: "daily",
  description: "Claim your daily reward",
  cooldown: 86400, // 24 hours in seconds
}).executes((ctx) => {
  // Implementation
});
```

### 🔒 Permission System

You can control who can use commands with the `requires` property:

```typescript
new Command({
  name: "admin",
  description: "Admin-only command",
  requires: (player) => player.hasTag("admin"),
}).executes((ctx) => {
  ctx.sender.sendMessage("You are an admin!");
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


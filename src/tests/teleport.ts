import { Command } from "../models/Command";

// TODO: Create a `target` argument type that can return an array for using @e, etc.

const root = new Command({
  name: "teleport",
  description: "Teleport to a player",
  aliases: ["tp"],
  requires: (player) => player.isOp(),
});

root.player("destination").executes((ctx, target) => {
  ctx.sender.teleport(target.location);
});

const destinationRoot = root.location("destination");

destinationRoot.boolean("checkForBlocks").executes((ctx, location, checkForBlocks) => {
  ctx.sender.teleport(location, {
    checkForBlocks,
  });
});

destinationRoot
  .int("yRot")
  .int("xRot")
  .boolean("checkForBlocks")
  .executes((ctx, location, yRot, xRot, checkForBlocks) => {
    ctx.sender.teleport(location, {
      rotation: {
        y: yRot,
        x: xRot,
      },
      checkForBlocks,
    });
  });

const facingRoot = destinationRoot.literal({
  name: "facing",
  description: "A entity or position to face after the teleport",
});

facingRoot
  .player("lookAtEntity")
  .boolean("checkForBlocks")
  .executes((ctx, location, lookAtEntity, checkForBlocks) => {
    ctx.sender.teleport(location, {
      facingLocation: lookAtEntity.location,
      checkForBlocks,
    });
  });

facingRoot
  .location("lookAtPosition")
  .boolean("checkForBlocks")
  .executes((ctx, location, lookAtPosition, checkForBlocks) => {
    ctx.sender.teleport(location, {
      facingLocation: lookAtPosition,
      checkForBlocks,
    });
  });

const victimRoot = root.player("victim");

victimRoot
  .player("destination")
  .boolean("checkForBlocks")
  .executes((_ctx, victim, destination, checkForBlocks) => {
    victim.teleport(destination.location, {
      checkForBlocks,
    });
  });

const victimDestinationRoot = victimRoot.location("destination");

victimDestinationRoot.boolean("checkForBlocks").executes((_ctx, victim, destination, checkForBlocks) => {
  victim.teleport(destination, {
    checkForBlocks,
  });
});

victimDestinationRoot
  .int("yRot")
  .int("xRot")
  .boolean("checkForBlocks")
  .executes((_ctx, victim, destination, yRot, xRot, checkForBlocks) => {
    victim.teleport(destination, {
      rotation: {
        y: yRot,
        x: xRot,
      },
      checkForBlocks,
    });
  });

const victimDestinationFacingRoot = victimDestinationRoot.literal({
  name: "facing",
  description: "A entity or position to face after the teleport",
});

victimDestinationFacingRoot
  .player("lookAtEntity")
  .boolean("checkForBlocks")
  .executes((_ctx, victim, destination, lookAtEntity, checkForBlocks) => {
    victim.teleport(destination, {
      facingLocation: lookAtEntity.location,
      checkForBlocks,
    });
  });

victimDestinationFacingRoot
  .location("lookAtPosition")
  .boolean("checkForBlocks")
  .executes((_ctx, victim, destination, lookAtPosition, checkForBlocks) => {
    victim.teleport(destination, {
      facingLocation: lookAtPosition,
      checkForBlocks,
    });
  });

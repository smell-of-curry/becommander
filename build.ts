import * as esbuild from "esbuild";
import * as fsExtra from "fs-extra";
const isDev = process.argv[2] === "dev";

// Ensure the output directory
const outputDir = "./scripts";
if (!fsExtra.pathExists(outputDir)) fsExtra.mkdirSync(outputDir);
fsExtra.emptyDirSync(outputDir);

// Build notification plugin
const notificationPlugin: esbuild.Plugin = {
  name: "notification-plugin",
  setup(build) {
    let buildStart = new Date();

    build.onStart(() => {
      buildStart = new Date();
      console.log(
        `\x1b[33m%s\x1b[0m`,
        `[${new Date().toLocaleTimeString()}]`,
        `🔄 Build started...`
      );
    });

    build.onEnd((result) => {
      const duration = new Date().getTime() - buildStart.getTime();

      if (result.errors.length > 0) {
        console.error(
          `\x1b[31m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `❌ Build failed with ${result.errors.length} error(s) in ${duration}ms`
        );
      } else {
        console.log(
          `\x1b[32m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `✅ Build completed successfully in ${duration}ms for ${
            isDev ? "development" : "production"
          } mode`
        );
      }
    });
  },
};

console.log(
  `Building project in ${isDev ? "development" : "production"} mode...`
);

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outfile: "scripts/index.js",
    bundle: true,
    minify: !isDev,
    format: "esm",
    watch: isDev,
    sourcemap: true, // Source map generation must be turned on
    plugins: [notificationPlugin],
    external: ["@minecraft/server"],
    legalComments: isDev ? "none" : "none",
    mainFields: ["main"], // Needed for @minecraft/math and @minecraft/vanilla-data
  })
  .then(() => {
    // Only display watching message in dev mode
    if (isDev) console.log("\x1b[36m%s\x1b[0m", "Watching for changes...");
  })
  .catch((error) => {
    // Only log the detailed error object since the plugin already shows the error header
    console.error(error);
    process.exit(1);
  });

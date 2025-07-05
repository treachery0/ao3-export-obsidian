import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { exec } from "node:child_process";

const prod = (process.argv[2] === "production");

const postBuildPlugin = {
    name: 'post-build-script',
    setup(build) {
        build.onEnd(result => {
            if(prod || result.errors.length) {
                return;
            }

            exec('./copy-to-sandbox.sh');
        });
    }
}

const context = await esbuild.context({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins
    ],
    plugins: [
        postBuildPlugin
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "dist/main.js",
    minify: prod,
});

if(prod) {
    await context.rebuild();
    process.exit(0);
}
else {
    await context.watch();
}

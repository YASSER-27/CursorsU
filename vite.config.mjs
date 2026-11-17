import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import JavaScriptObfuscator from "javascript-obfuscator";

function obfuscateProductionBundles() {
  return {
    name: "obfuscate-production-bundles",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue;
        output.code = JavaScriptObfuscator.obfuscate(output.code, {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: false,
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.35,
        }).getObfuscatedCode();
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), obfuscateProductionBundles()],
  build: {
    sourcemap: false,
  },
  server: {
    strictPort: true,
  },
});

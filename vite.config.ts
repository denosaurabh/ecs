import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer()],
  resolve: {
    alias: {
      "@core": "/src/core/index",
      "@demos": "/src/demos/index",
      "@utils": "/src/utils/index",
    },
  },
});

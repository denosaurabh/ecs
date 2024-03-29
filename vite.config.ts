import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ecs": "/src/engine/ecs/index",
      "@3d": "/src/engine/3d/index",
    },
  },
});

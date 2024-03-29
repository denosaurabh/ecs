import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@ecs": "/src/core/ecs/index",
      "@3d": "/src/core/3d/index",
    },
  },
});

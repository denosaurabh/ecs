import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@core": "/src/core/index",
      "@demos": "/src/demos/index",
      "@utils": "/src/utils/index",

      "@ecs": "/src/core/ecs/index",
      "@storage": "/src/core/storage/index",
      "@rendergraph": "/src/core/rendergraph/index",
      // "@utils": "/src/core/utils/index",

      "@3d/components": "/src/core/3d/components",
      "@3d/geometry": "/src/core/3d/geometry",
      "@3d/materials": "/src/core/3d/materials",
      "@3d/resources": "/src/core/3d/resources",
      "@3d/systems": "/src/core/3d/systems",
    },
  },
});

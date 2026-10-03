import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/portfolio-v1/",
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});
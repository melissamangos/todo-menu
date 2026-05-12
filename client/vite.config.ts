import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const sharedAlias = {
  "@todo-menu/shared": path.resolve(__dirname, "../shared/types/index.ts"),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: sharedAlias,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    alias: sharedAlias,
  },
});

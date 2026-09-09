/// <reference types="vite/client" />

const functionModules = import.meta.glob([
  "./**/*.ts",
  "!./**/*.d.ts",
  "!./**/*.test.ts",
  "!./test.setup.ts",
]);

export const modules = {
  ...functionModules,
  "./_generated/server.js": async () => ({}),
};

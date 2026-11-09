import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["source/**/?(*-)unit-test.ts"],
    benchmark: { include: ["source/**/?(*-)benchmark-test.ts"] },
  },
});

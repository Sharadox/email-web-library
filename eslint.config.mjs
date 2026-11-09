import javaScript from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import typeScriptEslint from "typescript-eslint";

export default defineConfig([
  javaScript.configs.recommended,
  ...typeScriptEslint.configs.recommended,
  prettier,
  globalIgnores(["documentation/**", "distribution/**"]),
]);

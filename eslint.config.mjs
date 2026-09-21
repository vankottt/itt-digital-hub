import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/settlement-analyzer/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Tools/Land Scope has its own package.json/toolchain; live analyzer is src/settlement-analyzer.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "qa/**", "references/**", ".ruflo/**", ".data/**", "Tools/**"]),
]);

export default eslintConfig;

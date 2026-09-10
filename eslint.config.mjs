import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "import/no-anonymous-default-export": "off",
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "public/models/*.glb", "tsconfig.tsbuildinfo"]),
]);

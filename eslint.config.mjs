import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `sanity build` output. Minified bundles, several megabytes of them —
    // linting them is meaningless and large enough to exhaust node's heap, so
    // without this `npm run lint` dies with an out-of-memory crash rather than
    // a lint report.
    "sanityStudio/dist/**",
  ]),
  {
    // Sanity document actions are camelCase by convention (`approveAndPublish`),
    // but the Studio renders them as React components and expects them to call
    // hooks such as `useDocumentOperation`. The rules-of-hooks check only sees a
    // lowercase function name and assumes a plain function. Renaming them to
    // PascalCase to satisfy the linter would break with every Sanity example.
    files: ["sanityStudio/actions/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;

/**
 *
 * List of all Eslint rules:
 * https://github.com/eslint/eslint/tree/main/lib/rules

 * List of all React rules:
 * https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules

 * List of all TypeScript Eslint rules:
 * https://typescript-eslint.io/rules/
 */

module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    // Add these rules if you know you want all that they each include. Otherwise, just add the explicit rules below.
    // "eslint:recommended",
    // "plugin:react/recommended",
    // "plugin:import/errors",
    // "plugin:import/warnings",
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 11,
    "sourceType": "module",
    "tsconfigRootDir": __dirname,
    "project": ["./tsconfig.json"],
  },
  "plugins": [
    // Add plugins here when needed for all non TS / TSX files.
    // "react",
    // "import"
  ],
  // These are the file types that ESLint will ignore
  // **/ ignores any amount of recursive directories beneath the current one
  "ignorePatterns": [
    "node_modules/",
    "dist/",
    "**/*.d.ts",
    ".eslintrc.cjs", // Ignore self
    // Explicitly ignore known TS files and dirs outside src
    "vite.config.ts",
    "sync.ts",
    "test_db2.ts",
    "api/"
  ],
  "rules": {

    // Common rules -------------------------------------------------------------------------------

    "prefer-const": ["error"],

    "indent": [2, "tab", {
      "flatTernaryExpressions": true,
      "offsetTernaryExpressions": false,
      "SwitchCase": 1,
    }],

    "quote-props": ["error", "as-needed"],
    "quotes": ["error", "double", { "avoidEscape": true }],
    "semi": ["error", "always"],
    "arrow-parens": ["error", "always"],

    // disable newlines before and after blocks (curlys)
    "padded-blocks": ["error", "never"],

    // add spaces between curlys for non JSX
    "object-curly-spacing": ["error", "always"],

    // add a space after commas where proper
    "comma-spacing": ["error", { "before": false, "after": true }],

    // prefer comma at the end
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "only-multiline",
      "exports": "only-multiline",
      "functions": "always-multiline",
    }],

    // prefer arrow functions unless the function is named
    "prefer-arrow-callback": ["error", { "allowNamedFunctions": true }],

    // chained . operator
    "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],

    // newlines for function args
    // "function-call-argument-newline": ["error", "always"],
    // "function-paren-newline": ["error", "multiline"],

    // newlines for arrays bigger than 3 - experiment with these, maybe minItems should be 1
    // "array-element-newline": ["error", { "minItems": 3 }],
    // "array-bracket-newline": ["error", { "minItems": 3 }],

    // don't allow functions to return without a curly and return keyword
    // "arrow-body-style": ["error", "always"],

    // line break after all operators except some - experiment with this later
    // "operator-linebreak": ["error", "after", {
    // 	"overrides": {
    // 		"+": "ignore",
    // 		"-": "ignore",
    // 	}
    // }],
  },
  // 'Overrides' tells ESLint what to do when it encounters TypeScript files
  // This is necessary to allow parsing of Javascript files as well
  // Information here: https://stephencharlesweiss.com/eslint-overrides
  "overrides": [
    {
      "files": ["src/**/!(*.test).ts"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.json",
        "moduleResolution": "node"
      },
      "plugins": [
        "@typescript-eslint",
        "react",
      ],
      "rules": {

        // TS rules ---------------------------------------------------------------------------

        "function-paren-newline": ["error", "multiline"],

        "@typescript-eslint/explicit-function-return-type": "error",
      },
    },
    {
      "files": ["src/**/*.tsx"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.json",
        "moduleResolution": "node"
      },
      "plugins": [
        "@typescript-eslint",
        "react",
      ],
      "rules": {

        // TSX rules --------------------------------------------------------------------------

        "react/jsx-wrap-multilines": ["error", {
          "declaration": "parens-new-line",
          "assignment": "parens-new-line",
          "return": "parens-new-line",
          "arrow": "parens-new-line",
          "condition": "parens-new-line",
          "logical": "parens-new-line",
          "prop": "parens-new-line",
        }],

        // sort props alphabetically
        "react/jsx-sort-props": ["error", {
          "noSortAlphabetically": false,
        }],

        // maximum number of props allowed on a single line. Default to 1.
        "react/jsx-max-props-per-line": ["error", { "maximum": { "single": 2, "multi": 1 } }],

        // the above keeps the first prop on the first line, so wrap it to the next
        "react/jsx-first-prop-new-line": ["error", "multiline"],

        // add the closing bracket at the end
        "react/jsx-closing-bracket-location": [1, "tag-aligned"],

        // don't add spaces inbetween curlys for jsx
        "react/jsx-curly-spacing": [2, "never"],

        // remove curly braces where not necessary in jsx
        "react/jsx-curly-brace-presence": [2, { "props": "never" }],

        // max depth of jsx, if going above 5, it's time to separate components
        "react/jsx-max-depth": [2, { "max": 5 }],

        // jsx < > spacing
        "react/jsx-tag-spacing": [2, {
          "closingSlash": "never",
          "beforeSelfClosing": "always",
          "afterOpening": "never",
          "beforeClosing": "never",
        }],

        /**
				 * jsx boolean prop removes unnecessary ={true} text
				 * <GreyLabelText
				 *     bold={true}
				 *     mr={1}
				 * />
				 * -->
				 * <GreyLabelText
				 *     bold
				 *     mr={1}
				 * />
				 */
        "react/jsx-boolean-value": [2, "never"],

        // disable newlines in jsx
        "react/jsx-newline": [2, { "prevent": true }],

        // Enforce PascalCase for user-defined JSX components
        "react/jsx-pascal-case": [2],

        // Disallow multiple spaces between inline JSX props
        "react/jsx-props-no-multi-spaces": [2],

        "react/self-closing-comp": [2, { "component": true, "html": true }],

        // add newline after curlys
        // "react/jsx-curly-newline": ["error", { "multiline": "consistent", "singleline": "forbid" }],

        // Disallows JSX context provider values from taking values that will cause needless rerenders
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
        // "react/jsx-no-constructed-context-values": [2],

        // Disallow unnecessary fragments
        // "react/jsx-no-useless-fragment": [2],

        // Require one JSX element per line
        // "react/jsx-one-expression-per-line": [2, { "allow": "none" }],

        // factory (eslint "indent") indent will not work well with these
        // indent regular jsx
        // "react/jsx-indent": [2, "tab", { "checkAttributes": false, "indentLogicalExpressions": false }],

        // indent jsx props
        // "react/jsx-indent-props": [2, "tab"],
      },
    },
    {
      "files": ["src/**/*.+(ts|tsx)"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.json",
        "moduleResolution": "node"
      },
      "plugins": [
        "@typescript-eslint",
        "react",
      ],
      "rules": {

        // TS + TSX rules --------------------------------------------------------------------------
        "keyword-spacing": ["error", {
          "after": true,
          "before": true,
        }],

        // require semicolons for interfaces
        "@typescript-eslint/member-delimiter-style": ["error", {
          "multiline": {
            "delimiter": "semi",
            "requireLast": true,
          },
          "singleline": {
            "delimiter": "semi",
            "requireLast": false,
          },
          "multilineDetection": "brackets",
        }],

        "no-restricted-imports": ["error", {
          "name": "@mui/icons-material",
          "message": 'Import icons directly, do not import from barrel file. "@mui/icons-material/${iconName}"'
        }]
      },
    },
  ]
};

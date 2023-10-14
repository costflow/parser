# Contributing to Costflow

Welcome, and thank you for your interest in contributing to Costflow!

Please make sure that all Costflow Parser codes' behavior should follow the rules of [Costflow Syntax](https://docs.costflow.io/syntax/).

## Getting started

Clone this repository and install its dependencies:

```bash
git clone https://github.com/costflow/parser
cd parser
npm install
```

`npm run build` builds the library to `dist`, generating three files:

- `dist/costflow.cjs.js`
  A CommonJS bundle, suitable for use in Node.js, that `require`s the external dependency. This corresponds to the `"main"` field in package.json
- `dist/costflow.esm.js`
  an ES module bundle, suitable for use in other people's libraries and applications, that `import`s the external dependency. This corresponds to the `"module"` field in package.json
- `dist/costflow.umd.js`
  a UMD build, suitable for use in any environment (including the browser, as a `<script>` tag), that includes the external dependency. This corresponds to the `"browser"` field in package.json

`npm run dev` builds the library, then keeps rebuilding it whenever the source files change using [rollup-watch](https://github.com/rollup/rollup-watch).

`npm test` builds the library, then tests it.

## Error

- ALPHA_VANTAGE_KEY_NOT_EXIST
- ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT
- FORMULA_LOOP
- FORMULA_NOT_FOUND

const pkg = require("../package.json");
const { babel } = require("@rollup/plugin-babel");
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const { visualizer } = require("rollup-plugin-visualizer");

const NODE_ENV = process.env.NODE_ENV || "production";
const isProduction = NODE_ENV === "production";

const getOutputFile = (entry, format) => {
  const suffix = isProduction ? "production.min" : "development";
  return `${format}/${entry}.${suffix}.js`;
};

const getPlugins = entry => [
  peerDepsExternal(),
  nodeResolve({
    mainFields: ["module", "jsnext:main", "main"],
  }),
  babel({
    babelHelpers: "bundled",
    exclude: "node_modules/**",
  }),
  replace({
    preventAssignment: true,
    values: {
      __DEV__: isProduction ? JSON.stringify(false) : JSON.stringify(true),
      __PACKAGE_NAME__: JSON.stringify(pkg.name),
      "process.env.NODE_ENV": isProduction ? JSON.stringify("production") : JSON.stringify("development"),
    },
  }),
  commonjs(),
  isProduction && terser(),
  visualizer({
    filename: `./stats.${entry}.${isProduction ? "production" : "development"}.html`,
  }),
];

const getExternal = entry => {
  return {
    "react-pixi-alias": ["react-pixi-fiber"],
  }[entry];
};

const getInput = entry => {
  return {
    "react-pixi-alias": "src/react-pixi-alias/index.js",
    "react-pixi-fiber": "src/index.js",
  }[entry];
};

const getConfig = (entry, format) => ({
  input: getInput(entry),
  output: {
    file: getOutputFile(entry, format),
    name: "ReactPixiFiber",
    exports: "named",
    format: format,
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
      "prop-types": "PropTypes",
      "pixi.js": "PIXI",
      "react-pixi-fiber": "ReactPixiFiber",
    },
    sourcemap: isProduction,
  },
  plugins: getPlugins(entry),
  external: getExternal(entry),
});

export default [
  getConfig("react-pixi-fiber", "cjs"),
  getConfig("react-pixi-alias", "cjs"),
  getConfig("react-pixi-fiber", "es"),
  getConfig("react-pixi-alias", "es"),
  getConfig("react-pixi-fiber", "umd"),
  getConfig("react-pixi-alias", "umd"),
];

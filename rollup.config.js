"use strict";

import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import screeps from 'rollup-plugin-screeps';
import dts from 'rollup-plugin-dts'; // for DTS bundling
import flatDts from 'rollup-plugin-flat-dts'; // for DTS bundling

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

export default [{
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [

    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src", declaration: true }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    screeps({ config: cfg, dryRun: cfg == null }),
    // flatDts({
    //   // Configuration options, e.g. for multiple entries
    //   entries: [
    //     { src: 'src', dist: 'dist' },
    //   ]
    // }),
  ]

},
// {
//   input: './dist/index.d.ts', // The entry point of your generated types
//   output: [{ file: 'dist/compiled.index.d.ts', format: 'es' }], // The final bundled d.ts file
//   plugins: [dts()],

// }
]

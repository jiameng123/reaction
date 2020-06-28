import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import path from "path";
import run from '@rollup/plugin-run';

const dev = process.env.ROLLUP_WATCH === 'true';
export default {
  input: "src/index.ts",
  output:[ 
    {
      file:"./dist/index.cjs.js",
      format: 'cjs'
    },
    {
     
      file:"./dist/index.amd.js",
      format: 'amd'
    },
    {
     
      file:"./dist/index.esm.js",
      format: 'esm'
    },
    {
      name:"rc",
      file:"./dist/index.umd.js",
      format: 'umd'
    },
    
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({
      configFile: path.resolve(__dirname, '.babelrc.json'),
      allowAllFormats: true,
      babelHelpers:'runtime'
    }),
    dev && run()
  ]
}

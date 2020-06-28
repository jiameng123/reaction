import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import path from "path";

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
     
      file:"./dist/index.iife.js",
      format: 'iife'
    },
    {
     
      file:"./dist/index.umd.js",
      format: 'umd'
    },
    {
      file:"./dist/index.system.js",
      format: 'system'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({
      configFile: path.resolve(__dirname, '.babelrc.json'),
      allowAllFormats: true,
      babelHelpers:'runtime'
    })
  ]
}

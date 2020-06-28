import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  input: "src/index.ts",
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel()
  ]
}

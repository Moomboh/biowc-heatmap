import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import { terser } from "rollup-plugin-terser"

export default {
  input: 'demo/app.ts',
  output: {
    file: 'dist/demo/bundle.js',
    format: 'es',
    name: 'bundle',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    copy({
      targets: [{
      src: 'demo/index.html',
      dest: 'dist/demo',
        transform: (contents) => contents.toString().replace('../dist/demo/app.js', 'bundle.js')
      }]
    }),
    terser()
  ],
};
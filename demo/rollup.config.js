import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import html from '@open-wc/rollup-plugin-html';

export default {
  input: 'demo/index.html',
  output: {
    dir: 'dist-demo',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      compilerOptions: {
        declaration: false,
      },
    }),
    html(),
    terser(),
  ],
};

import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/demo/',
  watch: !hmr,
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },
  appIndex: 'demo/index.html',
  plugins: [
    hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
  ],
});

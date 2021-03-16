/* eslint-disable import/no-extraneous-dependencies */
import glob from 'glob';
import esbuild from 'esbuild';

esbuild.buildSync({
  entryPoints: glob.sync('src/**/*.ts'),
  outdir: 'dist',
  platform: 'node',
  target: 'es2020',
  format: 'cjs',
});

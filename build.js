'use strict';

/* eslint-disable import/no-extraneous-dependencies */
const { build, glob } = require('estrella');

build({
  // esbuild options
  entry: glob('src/**/*.ts'),
  outdir: 'dist',
  platform: 'node',
  target: 'node10',
  format: 'cjs',

  // estrella options
  tslint: true,
});

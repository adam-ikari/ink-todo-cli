import esbuild from 'esbuild';
import { transform } from '@babel/core';
import fs from 'fs';

const babelPlugin = {
  name: 'babel',
  setup(build) {
    build.onLoad({ filter: /\.(jsx|tsx)$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, 'utf8');
      const result = await transform(source, {
        filename: args.path,
        presets: ['@babel/preset-react', '@babel/preset-typescript']
      });
      return { contents: result.code, loader: 'js' };
    });
  },
};

const config = {
  entryPoints: ['src/cli.tsx'],
  bundle: true,
  loader: {
    '.json': 'json'
  },
  platform: 'node',
  target: 'node16',
  outfile: 'dist/cli.js',
  format: 'esm',
  external: ['react', 'ink', 'zustand', 'chalk', 'meow'],
  plugins: [babelPlugin],
  minify: true,
  mangleProps: /^_/,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true
};

esbuild.build(config).catch(() => process.exit(1));
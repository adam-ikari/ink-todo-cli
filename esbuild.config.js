import esbuild from 'esbuild';
import { transform } from '@babel/core';
import fs from 'fs';
import path from 'path';

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
  alias: {
    '@': path.join(process.cwd(), 'src')
  },
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
  minify: process.env.NODE_ENV === 'production',
  mangleProps: process.env.NODE_ENV === 'production' ? /^_/ : undefined,
  minifyIdentifiers: process.env.NODE_ENV === 'production',
  minifySyntax: process.env.NODE_ENV === 'production',
  minifyWhitespace: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production'
};

esbuild.build(config).catch(() => process.exit(1));
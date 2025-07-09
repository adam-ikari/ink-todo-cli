import esbuild from 'esbuild';

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
};

esbuild.build(config).catch(() => process.exit(1));
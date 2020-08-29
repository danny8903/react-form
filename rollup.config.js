import path from 'path';
import rollupBabel from 'rollup-plugin-babel';
import rollupTypeScript from 'rollup-plugin-typescript';
import postcss from 'rollup-plugin-postcss';

const pkg = require(path.join(__dirname, 'package.json'));

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    'tslib',
    // @ts-ignore
    ...Object.keys(process.binding('natives')),
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    rollupTypeScript({
      target: 'es5',
      module: 'es6',
    }),
    postcss({ extract: false, modules: true }),
    rollupBabel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};

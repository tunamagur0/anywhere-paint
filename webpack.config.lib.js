const path = require('path');
const contentBase = path.resolve(__dirname, 'lib');

module.exports = {
  mode: 'production',
  entry: {
    lib: './src/anywherePaint.ts',
  },
  output: {
    path: contentBase,
    filename: 'anywherePaint.js',
    library: '',
    libraryTarget: 'umd',
    libraryExport: '',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts'],
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: true,
        },
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            outDir: 'lib',
          },
          onlyCompileBundledFiles: true,
        },
      },
    ],
  },
  devServer: {
    contentBase,
  },
};

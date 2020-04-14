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
    library: 'AnywherePaint',
    libraryTarget: 'umd',
    libraryExport: 'default',
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
        test: /\.worker\.ts$/,
        loader: 'worker-loader',
        options: {
          name: '[name].[hash].js',
          inline: true,
          publicPath: '/',
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
        },
      },
    ],
  },
  devServer: {
    contentBase,
  },
};

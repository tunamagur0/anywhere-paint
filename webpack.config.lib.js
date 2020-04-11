const path = require('path');
const contentBase = path.resolve(__dirname, 'public');

module.exports = {
  mode: 'development',
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
    extensions: ['.ts', '.js'],
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
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    open: true,
  },
  devServer: {
    contentBase: contentBase,
  },
};

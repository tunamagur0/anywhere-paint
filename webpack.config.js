const path = require('path');
const contentBase = path.resolve(__dirname, 'public');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
  },
  output: {
    path: contentBase,
    filename: '[name].bundle.js',
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

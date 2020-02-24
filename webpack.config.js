const path = require('path');
const contentBase = path.resolve(__dirname, 'public');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    colorRender: './src/colorRender.ts'
  },
  output: {
    path: contentBase,
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  devServer: {
    contentBase: contentBase
  }
};

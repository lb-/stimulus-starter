const path = require('path');

module.exports = {
  entry: {
    bundle: './src/index.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },

  mode: 'production',
  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: [/\.test\.js$/, /node_modules/], // not here - see react.context usage in src/index.js
        exclude: [/node_modules/],
        use: [{ loader: 'babel-loader' }],
      },
    ],
  },
};

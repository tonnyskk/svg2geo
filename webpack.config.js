var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
      dist: './src/index.js'
    },
  output: {
      path: __dirname,
      filename: '[name]/bundle.js',
      library: "Svg2Geo",
      libraryTarget: "var"
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};

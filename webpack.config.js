var webpack = require("webpack");
var path = require("path");

module.exports = {
  context: __dirname,
  entry: "./src/ViewModel.ts",
  output: {
    path: path.join(__dirname, "./www"),
    publicPath: "./",
    filename: "bundle.js"
  },
  externals: {
    gapi: "gapi"
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    /*new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })*/
  ],
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts']
  }
};
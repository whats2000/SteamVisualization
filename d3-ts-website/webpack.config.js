const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  entry: './src/index.ts',
  mode: argv.mode || 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.csv$/,
        use: [
          {
            loader: 'csv-loader',
            options: {
              dynamicTyping: true,
              header: true,
              skipEmptyLines: true,
            },
          },
        ],
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'json-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/data', to: 'data' },
      ],
    }),
  ],
});

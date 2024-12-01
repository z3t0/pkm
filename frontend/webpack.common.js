const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "/src/index.js", // main js
  output: {
    path: path.resolve(__dirname, "dist"), // output folder
    publicPath: "./",
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      // {
      //   test: /\.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/,
      // },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader", // for styles
        ],
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }

    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // base html
    }),
  ],
  resolve: { fallback: { "crypto": require.resolve("crypto-browserify"),
                         "stream": require.resolve("stream-browserify"),
                         "buffer": require.resolve("buffer"),
                         "path": require.resolve("path-browserify"),
                         "fs": require.resolve("browserify-fs"),
                         "util": require.resolve("util")
                       },

           },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  }
};
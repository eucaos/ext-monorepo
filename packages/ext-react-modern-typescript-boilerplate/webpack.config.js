const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtWebpackPlugin = require("@sencha/ext-react-webpack-plugin");
const portfinder = require("portfinder");
const sourcePath = path.join(__dirname, "./src");

module.exports = function(env = {}) {
  var browserprofile;
  var watchprofile;
  var buildenvironment =
    env.environment || process.env.npm_package_extbuild_defaultenvironment;
  if (buildenvironment == "production") {
    browserprofile = false;
    watchprofile = "no";
  } else {
    if (env.browser == undefined) {
      env.browser = true;
    }
    browserprofile = JSON.parse(env.browser) || true;
    watchprofile = env.watch || "yes";
  }
  const isProd = buildenvironment === "production";
  var buildprofile =
    env.profile || process.env.npm_package_extbuild_defaultprofile;
  var buildenvironment =
    env.environment || process.env.npm_package_extbuild_defaultenvironment;
  var buildverbose =
    env.verbose || process.env.npm_package_extbuild_defaultverbose;
  if (buildprofile == "all") {
    buildprofile = "";
  }
  if (env.treeshake == undefined) {
    env.treeshake = false;
  }
  var treeshake = env.treeshake ? JSON.parse(env.treeshake) : false;

  portfinder.basePort = (env && env.port) || 1962;
  return portfinder.getPortPromise().then(port => {
    const plugins = [
      new HtmlWebpackPlugin({
        template: "index.html",
        hash: true
      }),
      new ExtWebpackPlugin({
        framework: "react",
        toolkit: "modern",
        port: port,
        emit: true,
        browser: browserprofile,
        profile: buildprofile,
        watch: watchprofile,
        environment: buildenvironment,
        verbose: buildverbose,
        theme: "custom-ext-react-theme",
        treeshake: treeshake,
        packages: []
      })
    ];
    if (!isProd) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    return {
      mode: "development",
      cache: true,
      devtool: isProd ? "source-map" : "cheap-module-source-map",
      context: sourcePath,
      entry: {
        app: ["./index.tsx"]
      },
      output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js"
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  plugins: ["@sencha/ext-react-babel-plugin"]
                }
              },
              {
                loader: "awesome-typescript-loader"
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
        // The following is only needed when running this boilerplate within the ext-react repo.  You can remove this from your own projects.
        alias: {
          "react-dom": path.resolve("./node_modules/react-dom"),
          react: path.resolve("./node_modules/react")
        }
      },
      plugins,
      devServer: {
        contentBase: "./build",
        historyApiFallback: true,
        hot: false,
        host: "0.0.0.0",
        port: port,
        disableHostCheck: false,
        compress: isProd,
        inline: !isProd,
        stats: {
          assets: false,
          children: false,
          chunks: false,
          hash: false,
          modules: false,
          publicPath: false,
          timings: false,
          version: false,
          warnings: false,
          colors: {
            green: "\u001b[32m"
          }
        }
      }
    };
  });
};

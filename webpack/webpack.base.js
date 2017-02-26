var path = require('path');
var qs = require('qs');
var argv = require('minimist')(process.argv.slice(2));
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var isProduction = !!((argv.env && argv.env.production) || argv.p);
var sourceMapQueryStr = !isProduction ? '+sourceMap' : '-sourceMap';

var pkgPath = path.resolve(__dirname, '../package.json');

// We use "homepage" field to infer "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
// Remove any slash
var homepagePath = require(pkgPath).homepage.replace(/\/$/, '');

module.exports = {
  entry: {
    app: [path.resolve(__dirname, '../src/main.js')]
  },
  output: {
    chunkFilename: '[id].chunk.js',
    filename: 'js/[name].[hash].js',
    path: path.resolve(__dirname, '../build'),
    publicPath: (isProduction) ? homepagePath : '/', // if dev. just serve from local
    sourceMapFilename: '[name].[hash].js.map'
  },
  resolve: {
    alias: {
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'src': path.resolve(__dirname, '../src'),
      'vue$': 'vue/dist/vue.js'
    }
  },
  devServer: {
    colors: true,
    historyApiFallback: true,
    inline: true
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader',
        test: /\.js?$/
      },
      {
        exclude: /node_modules/,
        loader: 'vue-loader',
        test: /\.vue$/
      },
      {
        exclude: /node_modules/,
        loader: 'html-loader',
        test: /\.html$/
      },
      {
        exclude: [/(node_modules)(?![/|\\](bootstrap|foundation-sites))/],
        test: /\.js$/,
        loaders: [{
          loader: 'babel-loader',
          query: {
            presets: [[path.resolve('./node_modules/babel-preset-es2015'), { modules: false }]],
            cacheDirectory: true
          }
        }]
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, '../src'),
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: [
            `css-loader?${sourceMapQueryStr}`,
          ]
        }),
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, '../src'),
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          publicPath: '../',
          loader: [
            `css-loader?${sourceMapQueryStr}`,
            `resolve-url-loader?${sourceMapQueryStr}`,
            `sass-loader?${sourceMapQueryStr}`,
          ]
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg|xml|json)$/,
        include: path.resolve(__dirname, '../src'),
        loaders: [
          `file-loader?${qs.stringify({
            name: 'assets/img/[name].[ext]',
          })}`
        ]
      },
      {
        test: /\.(ttf|eot)$/,
        include: path.resolve(__dirname, '../src'),
        loader: `file-loader?${qs.stringify({
          name: 'assets/vendor/[name].[ext]'
        })}`
      },
      {
        test: /\.woff2?$/,
        include: path.resolve(__dirname, '../src'),
        loader: `url-loader?${qs.stringify({
          limit: 10000,
          mimetype: 'application/font-woff',
          name: 'assets/vendor/[name].[ext]'
        })}`
      },
      {
        test: /\.(ttf|eot|woff2?|png|jpe?g|gif|svg)$/,
        include: /node_modules/,
        loader: 'file-loader',
        query: {
          name: 'assets/vendor/[name].[ext]'
        }
      }
    ]
  }
};
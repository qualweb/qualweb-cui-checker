const path = require('path');
const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtReloader = require('webpack-ext-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const { version } = require('./package.json');

const config = {
  mode: 'development',
  entry: {
    background: './src/background/background.ts',
    content: './src/content/content.ts',
    sidebar: './src/sidebar/sidebar.ts',
    options: './src/options/options.js',

  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    alias: {
   'vue': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.ts', '.js', '.vue'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyPlugin({
      patterns: [
      // { from: 'devtools.html', to: 'devtools.html', transform: transformHtml },
      { from: 'src/content/content.ts', to: 'content.js' },
      { from: 'src/background/background.ts', to: 'background.js' },
      { from: './node_modules/@qualweb/qw-page/dist/qw-page.bundle.js', to: 'qwPage.js' },
      { from: './node_modules/@qualweb/util/dist/__webpack/util.bundle.js', to: 'util.js' },
      { from: './node_modules/@qualweb/act-rules/dist/__webpack/act.bundle.js', to: 'act.js' },
      { from: './node_modules/@qualweb/cui-checks/dist/__webpack/cui.bundle.js', to: 'cui.js' },
      { from: './node_modules/@qualweb/cui-checks/dist/__webpack/common-words-pt.txt', to: 'common-words-pt.txt' },
      { from: './node_modules/@qualweb/wcag-techniques/dist/__webpack/wcag.bundle.js', to: 'wcag.js' },
      { from: 'src/locales/en.js', to: 'locales/en.js' },
      { from: 'src/sidebar/evaluate.js', to: 'sidebar/evaluate.js' },
      { from: 'src/sidebar/detect.js', to: 'sidebar/detect.js' },
      { from: 'src/sidebar/interact.js', to: 'sidebar/interact.js' },
      { from: 'src/sidebar/sidebar.html', to: 'sidebar/sidebar.html', transform: transformHtml },
      { from: 'src/options/options.html', to: 'options/options.html', transform: transformHtml },
      { 
        from: 'src/icons', 
        to: 'icons', 
        globOptions: { 
          ignore: ['**/icon.xcf'] 
        } 
      },
      { from: 'src/popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
      { from: 'src/options/options.html', to: 'options/options.html', transform: transformHtml },
      {
        from: 'manifest.json',
        to: 'manifest.json',
      }
    ]
  }),
    new ExtReloader({
      manifest: path.resolve(__dirname, "manifest.json")
    }),  ],
};

if (config.mode === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    })
  );
}

if (process.env.HMR === 'true') {
  config.plugins.push(
    new ExtensionReloader({
      manifest: path.resolve(__dirname, 'src/manifest.json'),
    })
  );
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;

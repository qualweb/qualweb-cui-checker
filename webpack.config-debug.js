const path = require('node:path');
const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { version } = require('./package.json'); 
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('node:fs');
const definitions = JSON.parse(fs.readFileSync("./definitions.json", "utf-8"));

// --- Configuration Object for Production ---
const config = {
    mode: 'production', 
    entry: {
        background: './src/background/background.ts',
        content: './src/content/content.ts',
        sidepanel: './src/sidepanel/sidepanel.ts',
        options: './src/options/options.js',

    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',

        publicPath: '/', 
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.esm-bundler.js', 
            "@microsoft/recognizers-text-number-with-unit": path.resolve(
                __dirname,
                "node_modules/@microsoft/recognizers-text-number-with-unit/dist/recognizers-text-number-with-unit.es5.js"
            ),
        },
        extensions: ['.ts', '.js', '.vue'],
    },
    optimization :{
        minimize: false,
    minimizer: [
        new TerserPlugin({
          exclude: /cui\.js$|act\.js$|wcag\.js$|qwPage\.js$|util\.js$/,
        }),
    ],},
    
    devtool: false, 
    
    module: {
        rules: [


            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: { appendTsSuffixTo: [/\.vue$/] }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        compatConfig: {
                            MODE: 2
                        }
                    },
                }
            },
            {
                test: /\.js$/,
        
                exclude: /node_modules/, 
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { modules: false }]], 
                    },
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'] 
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
                type: 'asset/resource',
                generator: {
                  filename: 'images/[name][ext]'
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource',
                generator: {
                  filename: 'fonts/[name][ext]'
                }
            },
        ],
    },
    

    plugins: [
        new webpack.DefinePlugin({
            APP_CONFIG: JSON.stringify(definitions),
            '__VUE_OPTIONS_API__': JSON.stringify(true),
            '__VUE_PROD_DEVTOOLS__': JSON.stringify(false), // Disable Devtools
            '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        
        new CopyPlugin({
            patterns: [
               { from: './node_modules/@qualweb/qw-page/dist/qw-page.bundle.js', to: 'scripts/qwPage.js' },
                { from: './node_modules/@qualweb/util/dist/__webpack/util.bundle.js', to: 'scripts/util.js' },
                { from: './node_modules/@qualweb/act-rules/dist/__webpack/act.bundle.js', to: 'scripts/act.js' },
                { from: './node_modules/@qualweb/cui-checks/dist/__webpack/cui.bundle.js', to: 'scripts/cui.js' },
                { from: './node_modules/@qualweb/wcag-techniques/dist/__webpack/wcag.bundle.js', to: 'scripts/wcag.js' },
                { from: './node_modules/@qualweb/cui-checks/dist/__webpack/common-words-pt.txt', to: 'resources/common-words-pt.txt' },
                { from: 'src/sidepanel/evaluate.js', to: 'sidepanel/evaluate.js' },
                { from: 'src/sidepanel/detect.js', to: 'sidepanel/detect.js' },
                { from: 'src/sidepanel/interact.js', to: 'sidepanel/interact.js' },
                { from: 'src/sidepanel/sidepanel.html', to: 'sidepanel/sidepanel.html', transform: transformHtml },
                { from: 'src/options/options.html', to: 'options/options.html', transform: transformHtml },
                 { from: '**/*', to: 'resources/', context:'src/assets/' },
                { 
                    from: 'src/icons', 
                    to: 'icons', 
                    globOptions: { 
                        ignore: ['**/icon.xcf'] 
                    } 
                },
                { from: './manifest.json', to: 'manifest.json' }
            ]
        }),
    ],
};

function transformHtml(content) {
    return ejs.render(content.toString(), {
        ...process.env,
    });
}

module.exports = config;
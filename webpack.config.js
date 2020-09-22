/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


const DIR_SRC = join(__dirname, 'src')
const DIR_DIST = join(__dirname, 'dist')
const IS_PRODUCTION = process.argv.some((arg) => arg === 'production' || arg === '--production')

module.exports = {
    mode: IS_PRODUCTION ? 'production' : 'development',
    target: 'web',
    entry: {
        main: [
            'core-js/stable',
            'regenerator-runtime/runtime',
            join(DIR_SRC, 'index'),
        ],
    },
    output: {
        path: DIR_DIST,
        publicPath: '/',
        filename: 'index.min.js',
        libraryTarget: 'umd',
    },
    devtool: IS_PRODUCTION ? false : 'inline-source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            ["@babel/preset-env"],  // Defaults to ES5.
                            ["@babel/preset-typescript", {allowNamespaces: true}]
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-class-properties", { loose: true }],
                            ["@babel/plugin-proposal-optional-chaining"],
                            ["@babel/plugin-proposal-nullish-coalescing-operator"],
                        ]
                    }
                }
            },
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        ...(process.env.ANALYZE ? [
            new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: true,
            //   reportFilename: path.join(__dirname, 'bundle-report.html'),
            }),
        ] : []),
    ],

}

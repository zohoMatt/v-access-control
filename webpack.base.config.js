const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.bundle.js',
        library: 'VueAccess',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { babelrc: true }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UglifyJsPlugin()
    ]
}
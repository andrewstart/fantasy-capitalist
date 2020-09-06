const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => ({
    entry: './src/index.ts',
    mode: env.development ? 'development' : 'production',
    devtool: env.development ? 'inline-source-map' : 'source-map',
    devServer: {
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            title: 'Fantasy Capitalist'
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        }),
        new CopyPlugin({
            patterns: [{
                from: path.join(__dirname + '/static'),
                to: path.resolve(__dirname, './dist')
            }]
        }),
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
});
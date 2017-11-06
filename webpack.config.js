const path = require('path');

module.exports = {
    entry: "./demo/main.js",
    output: {
        path: path.resolve(__dirname, "demo"),
        filename: "build.js",
        publicPath: './impublic/demo/',
        chunkFilename: "[name].chunk.js?v=[hash]"
    },
    module: {
        rules: [
            {
                test: /\.exec\.js$/,
                use: ['script-loader']
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: [{loader: 'url-loader', options: {limit: 81920}}]
            },
            {
                test: /\.html$/,
                use: [{loader: 'html-loader', options: {minimize: true}}]
            },
            {
                test: /\.css$/,
                use: [{loader: "style-loader"}, {loader: "css-loader"}]
            },
            {
                test: /\.less$/,
                use: [{loader: "style-loader"}, {loader: "css-loader"}, {loader: "less-loader"}]
            },
            {
                test: /\.json/,
                use: ['json-loader']
            }
        ]
    },
};

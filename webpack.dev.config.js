module.exports = {
    entry: {
        app: [__dirname + '/client/index.jsx']
    },
    output: {
        filename: '[name].js',
        publicPath: 'http://localhost:3000/assets',
        path: '/',
    },
    devServer: {
        hot: true,
        inline: true,
        watchOptions: {
            ignored: ['node_modules/', 'test/', 'server/', 'test/', 'public/'],
        },
    },
    module: {
        rules: [
            {
              test: /\.(js|jsx)$/,
              loaders: 'babel-loader',
              exclude: /node_modules/,
              query: {
                presets: ['react', 'stage-0']
              }
            },
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]},
            {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'},
        ]
    }
};
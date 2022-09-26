//let NodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
let webpack = require('webpack');
module.exports = function override(config, env) {
    //do stuff with the webpack config...
    let fallback = {
        fs: false,
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        //url: require.resolve('url'),
        buffer: require.resolve('buffer/'),
        //util: require.resolve('util/'),
        stream: require.resolve('stream-browserify/'),
        constants: require.resolve("constants-browserify"),
        //vm: require.resolve('vm-browserify'),
        zlib: require.resolve("browserify-zlib")
        };
    //console.log(config.resolve);
    config.resolve.fallback = Object.assign({}, config.resolve.fallback, fallback);
    //config.resolve.plugins.push(new NodePolyfillWebpackPlugin());
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}

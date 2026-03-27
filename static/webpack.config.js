const path = require('path');

/**
 * Common configurations set in appConfig.
 */
const appConfig = {
    entry: {
        // Defines separate entry points and their output names
        'core-bundle': path.resolve(__dirname, './core/js/app.js'),
        'users-bundle': path.resolve(__dirname, './users/js/main.js'),
        'tasks-bundle': path.resolve(__dirname, './tasks/js/main.js')
    },
    output: {
        filename: '[name].js', // The output ES5 bundle, [name] is replaced by the entry key
        chunkFilename: '[name].[contenthash].js', 
        path: path.resolve(__dirname, 'dist'),
        //publicPath: '/', @todo: lookinto publicpath meaning
    },
    mode: 'development', // on prod change to: 'production',
    devtool: 'source-map', // Generate source maps for debugging
    cache: false, // Disable webpack cache to pick up file changes immediately
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    stats: {
        errorDetails: true,
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "url": require.resolve("url/"),
            "zlib": require.resolve("browserify-zlib"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "assert": require.resolve("assert/")
        }
    },
};

/**
 * Webpack export definitions
 * Export a function so we can select a single entry 
 * with `--env entry=core|tasks`\
 */
module.exports = (env = {}) => {
    const entry = env.entry;
    if (entry === 'users') {
        return {
            mode: appConfig.mode,
            devtool: appConfig.devtool,
            cache: appConfig.cache,
            entry: appConfig.entry['users-bundle'],
            output: appConfig.output,
            module: appConfig.module,
            stats: appConfig.stats,
            resolve: appConfig.resolve,
        };
    }

    if (entry === 'tasks') {
        return {
            mode: appConfig.mode,
            devtool: appConfig.devtool,
            cache: appConfig.cache,
            entry: appConfig.entry['tasks-bundle'],
            output: appConfig.output,
            module: appConfig.module,
            stats: appConfig.stats,
            resolve: appConfig.resolve,
        };
    }

    // Default: build all bundles
    return appConfig;
};
const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for node modules
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "buffer": require.resolve("buffer"),
    "process": require.resolve("process/browser"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "net": false,
    "tls": false
  });
  config.resolve.fallback = fallback;

  // Add plugins
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]);

  // Add resolve extensions
  config.resolve.extensions = [...(config.resolve.extensions || []), '.ts', '.js'];

  // Add module rules
  config.module = {
    ...config.module,
    rules: [
      ...(config.module.rules || []),
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  };

  return config;
}; 
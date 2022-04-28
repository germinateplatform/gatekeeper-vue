module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    resolve: {
      // ... rest of the resolve config
      fallback: {
        'path': require.resolve('path-browserify')
      }
    },
    devtool: 'source-map',
    target: 'web'
  }
}
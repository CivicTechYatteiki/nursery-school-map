const { merge } = require('webpack-merge')
const path = require('path')

module.exports = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    return merge(config, {
      resolve: {
        alias: {
          'react-spring': path.resolve(__dirname, 'utils/overrides/react-spring.js'),
          'orig-react-spring': path.resolve(__dirname, 'node_modules/react-spring')
        }
      }
    })
  },
}

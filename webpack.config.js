const path = require('path');

module.exports = {
  entry: {
    background: './background.js',
    offscreen: './offscreen.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  target: 'webworker',
  mode: 'production'
};

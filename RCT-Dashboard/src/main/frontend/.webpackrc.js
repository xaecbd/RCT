const {
  resolve
} = require('path');

module.exports = {
  output: {
    path: resolve('../resources/static'),
  },
  module: {
    rules: [      {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'public/images/'
          }
        }
      ]
    }]
  }
};

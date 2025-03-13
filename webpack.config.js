const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// Check if favicon exists
const faviconPath = path.resolve(__dirname, 'public', 'favicon.ico');
const faviconExists = fs.existsSync(faviconPath);

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV !== 'production';

// Define public URL based on environment
const publicUrl = isDevelopment ? '' : '/FreeManhwa';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: isDevelopment ? '/' : '/FreeManhwa/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/[name][ext]'
        }
      },
      {
        test: /manifest\.json$/,
        type: 'asset/source',
        generator: {
          filename: '[name][ext]'
        },
        use: {
          loader: 'string-replace-loader',
          options: {
            search: '%PUBLIC_URL%',
            replace: publicUrl
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      ...(faviconExists && { favicon: faviconPath }),
      templateParameters: {
        publicUrl
      }
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    hot: true,
    port: 3000,
    historyApiFallback: true,
    open: true
  }
}; 
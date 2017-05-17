const path              = require('path');
const webpack           = require('webpack');
const merge             = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

console.log('Starting webpack process...');

// Determine build env by npm command options
const TARGET_ENV = process.env.npm_lifecycle_event === 'build' ? 'production' : 'development';
const ENV = {
  'port': process.env.PORT || 8080,
  'host': process.env.HOST || 'localhost',
  'url': process.env.URL || 'https://yagisan.info',
  'title': process.env.TITLE || 'ペットヤギの飼いかた',
  'description': process.env.DESCRIPTION || `
  ヤギさんをペットとして飼うための情報を、ペットヤギ伝道師がお伝えします。
  ヤギの見つけ方、ヤギを飼える賃貸物件の探し方、ミニヤギなどのヤギの種類、室内での飼い方、餌の選び方、健康管理、仕事とのやりくりなど、実際にヤギをペットとして飼う方の指針となる情報を発信していきます。
  `,
};

// Common webpack config
const commonConfig = {

  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: '[name].js',
  },

  entry: {
    index: [
      path.join( __dirname, 'src/index.js' )
    ],
  },

  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules'
    ],
  },

  module: {
    rules: [
      {
        test: /\.(eot|ttf|woff|woff2|svg)$/,
        use: 'file-loader',
      },
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
      {
        test: /\.(jpg|jpeg|png)$/,
        use: 'url-loader'
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['index'],
      template: 'src/pug/index.pug',
      inject:   'body',
      filename: 'index.html',
      data: ENV,
      hash: true,
      minify: {
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        html5: true,
        removeComments: true,
      },
    }),

    // Inject variables to JS file.
    new webpack.DefinePlugin({
      'process.env':
        Object.keys(ENV).reduce((o, k) =>
          merge(o, {
            [k]: JSON.stringify(ENV[k]),
          }), {}
        ),
    }),
  ],

}

// Settings for `npm start`
if (TARGET_ENV === 'development') {
  console.log('Serving locally...');

  module.exports = merge(commonConfig, {

    devServer: {
      contentBase: 'src',
      inline: true,
      port: ENV.port,
      host: ENV.host,
    },

    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
            'postcss-loader',
          ]
        },
      ]
    }
  });
}

// Settings for `npm run build`.
if (TARGET_ENV === 'production') {
  console.log('Building for prod...');

  module.exports = merge(commonConfig, {

    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader',
              'sass-loader',
              'postcss-loader',
            ]
          }),
        },
      ]
    },

    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'src/img/logo.svg',
          to: 'img/'
        },
        {
          from: 'src/img/favicon.ico',
        },
        {
          from: 'src/CNAME',
        },
      ]),

      // Extract CSS into a separate file
      new ExtractTextPlugin({ filename: './[hash].css', allChunks: true }),

      // Minify & mangle JS/CSS
      new webpack.optimize.UglifyJsPlugin({
          minimize:   true,
          compressor: { warnings: false }
          // mangle:  true
      }),
    ]
  });
}

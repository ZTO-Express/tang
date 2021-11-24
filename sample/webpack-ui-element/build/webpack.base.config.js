const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const path = require('path')
const Dotenv = require('dotenv-webpack')

function getConfigPath(mode) {
  return path.resolve(process.cwd(), `.env.${mode}`)
}
module.exports = {
    entry: './src/main.ts',
    cache: {
      type: 'filesystem'  // 持久化缓存
    },
    output: {
        filename: 'js/[name].[chunkhash:5].js',
        path: path.resolve(__dirname, "../dist")
      },
    module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.(t|j)s$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
              },
            ],
          },
          // {
          //     test: /\.(t|j)s$/,
          //     exclude: /node_modules/,
          //     use: [
          //       {
          //         loader: 'ts-loader',
          //         options: {
          //           // 指定特定的ts编译配置，为了区分脚本的ts配置
          //           configFile: path.resolve(__dirname, '../tsconfig.json'),
          //           // 对应文件添加个.ts或.tsx后缀
          //           appendTsSuffixTo: [/\.vue$/],
          //           transpileOnly: true // 关闭类型检测，即值进行转译
          //         },
          //       },
          //     ],
          // },
          {
            test: /\.css$/,
            use: [
              // 'vue-style-loader',
              // 'style-loader',
              MiniCssExtractPlugin.loader,
              'postcss-loader',
              'css-loader'
            ],
          },
          {
            test: /\.less$/,
            use: [
              // 'vue-style-loader',
              MiniCssExtractPlugin.loader,
              // 'style-loader',
              'css-loader',
              'postcss-loader',
              'sass-loader'
            ],
          },
          {
            test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 1024,
                },
              }
            ]
          },
          // {
          //   test: /\.(html|tpl)$/,
          //   loader: 'html-loader'
          // }
        ]
    },
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minChunks: 1, // 最小使用的次数 
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        minChunks: 1,
        cacheGroups: {
          // 提取公共js
          commons: {
            chunks: "all", // initial
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            name: "commons"
          }
        }
      }
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            title: 'webpack5+Vue3'
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
          filename: "style/[name].[hash:8].css",
          chunkFilename: "style/[hash:8].css"
        }),
        new ForkTsCheckerWebpackPlugin(),
        new Dotenv({
          path: getConfigPath(process.env.NODE_ENV)
        }),
        new BundleAnalyzerPlugin(),
        new ProgressBarPlugin()
    ]
}
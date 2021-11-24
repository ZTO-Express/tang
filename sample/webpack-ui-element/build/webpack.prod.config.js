const { merge } = require('webpack-merge')
const common = require('./webpack.base.config')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
// const smp = new SpeedMeasurePlugin()
module.exports = merge(common,{
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin()
    ]
})
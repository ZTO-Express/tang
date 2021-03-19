const presets = require('./presets')
const actions = require('./actions')

module.exports = async () => {
  return {
    description: '测试插件描述',
    contact: {
      name: 'rayl',
      url: 'https://github.com/ZTO-Express/tang',
      email: 'rayl@pisaas.com'
    },
    presets, // 包含默认预设
    actions
  }
}

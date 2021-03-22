const hooks = require('../hooks')
const processors = require('../processors')

module.exports = {
  name: 'default', // 预设名称
  title: '默认预设', // 标题
  description: '此预设用于tang-test默认测试', // 描述

  get () {
    return {

  processors, // 需要加载的处理器（默认）
  hooks // 需要加载的钩子（默认）
};
    }
  }

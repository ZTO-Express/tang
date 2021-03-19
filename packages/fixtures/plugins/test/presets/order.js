const hooks = require('../hooks')
const processors = require('../processors')

module.exports = {
  name: 'order', // 预设名称
  title: '顺序预设', // 标题
  description: '此预设用于tang-test测试，处理器有顺序要求', // 描述
  loaders: [],
  parsers: [],
  generators: [],
  outputers: [],
  processors,
  hooks
};

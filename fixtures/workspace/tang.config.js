const yapiPlugin = require('tang-plugin-yapi');

const processors = require('./codegen/processors');
const templateRender = require('./codegen/templateRender');

const yapiLoader = yapiPlugin.yapiLoader();

module.exports = {
  rootDir: './',
  options: {
    codegen: {
      baseDir: './codegen',
      templatesDir: './templates',
      render: templateRender,
    },
    yapi: {
      url: 'https://yapi.baidu.com',
      tokens: [
        '842ed98e16b54025921fadf015c80270c4184a6607ce46b81d80972657fb494c',
      ],
    },
  },
  presets: {
    page: {
      use: true,

      // 执行选项
      processOptions: {
        loader: yapiLoader,
        parser: processors.pageParser(),
        generator: 'codegen',
        output: 'local',
      },
    },
    api: {
      // 执行选项
      processOptions: {
        loader: yapiLoader,
        generator: processors.yapiTsGenerator(),
      },

      // 编译选项
      compileOptions: {
        skipParse: true,
        skipOutput: true, // 跳过输出
      },
    },
    json: {
      // 执行选项
      processOptions: {
        loader: yapiLoader,
        parser: 'json',
        generator: 'json',
        generateOptions: {
          name: 'yapi.json',
        },
        outputer: 'local',
        outputOptions: {
          outputDir: './codegen/json',
        },
      },
    },
  },
};

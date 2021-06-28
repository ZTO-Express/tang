const yapiPlugin = require('tang-plugin-yapi');

const processors = require('./codegen/processors');
const templateRender = require('./codegen/templateRender');
const yapiTsGeneratorConfig = require('./codegen/tsGeneratorConfig');

const yapiLoader = yapiPlugin.yapiLoader();
const yapiTsGenerator = yapiPlugin.tsGenerator(yapiTsGeneratorConfig);

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
      hooks: [
        {
          trigger: 'load',
          apply(compilation) {
            console.log('正在加载文档');
          },
        },
        {
          trigger: 'parse',
          apply(compilation) {
            console.log('正在解析文档');
          },
        },
        {
          trigger: 'loaded',
          apply(compilation) {
            console.log('文档加载完成');
          },
        },
        {
          trigger: 'generate',
          apply(compilation) {
            console.log('正在生成文档');
          },
        },
        {
          trigger: 'output',
          apply(compilation) {
            console.log('正在输出文档');
          },
        },
        {
          trigger: 'generated',
          apply(compilation) {
            console.log('文档已生成');
          },
        },
      ],
    },
    api: {
      // 执行选项
      processOptions: {
        loader: yapiLoader,
        generator: yapiTsGenerator,
        output: 'local',
      },

      // 编译选项
      compileOptions: {
        skipParse: true,
      },

      hooks: [
        {
          trigger: 'load',
          apply(compilation) {
            console.log('正在加载文档');
          },
        },
        {
          trigger: 'loaded',
          apply(compilation) {
            console.log('文档加载完成');
          },
        },
        {
          trigger: 'generate',
          apply(compilation) {
            console.log('正在生成文档');
          },
        },
      ],
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

const processors = require('./codegen/processors');
const templateRender = require('./codegen/templateRender');

module.exports = {
  rootDir: './',
  options: {
    codegen: {
      baseDir: './codegen',
      templatesDir: './templates',
      render: templateRender,
    },
    yapi: {
      url: 'http://yapi.dev.ztosys.com/',
      tokens: [
        '6ee016eabd75db091ad615891004f74e9c922bd76bcea4116294324d34b4fc58',
      ],
    },
  },
  presets: [
    {
      use: true,
      name: 'page',

      // 执行选项
      processOptions: {
        loader: 'yapi',
        parser: processors.pageParser(),
        generator: 'codegen',
        output: 'local',
      },
    },
    {
      name: 'api',

      // 执行选项
      processOptions: {
        loader: 'yapi',
        generator: processors.yapiTsGenerator(),
      },

      // 编译选项
      compileOptions: {
        skipParse: true,
        skipOutput: true, // 跳过输出
      },
    },
    {
      name: 'json',

      // 执行选项
      processOptions: {
        loader: 'yapi',
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
  ],
};

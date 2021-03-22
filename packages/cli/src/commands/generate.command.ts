import { CliCommand } from '../common';

export class GenerateCommand implements CliCommand {
  config() {
    return {
      name: 'generate',
      args: '<entry>',
      aliases: ['gen'],
      description: '生成操作',
      argsDescription: {
        entry: '文档位置或地址',
      },
      options: [
        {
          flags: '--preset <preset>',
          description: '预设名称类型 pluginName[@version]:persetName',
        },
        {
          flags: '-l --loader <loader>',
          description: '加载器名称',
        },
        {
          flags: '-lo --loadOptions <loadOptions>',
          description: '加载选项',
        },
        {
          flags: '-p --parser <parser>',
          description: '解析器名称',
        },
        {
          flags: '-po --parseOptions <parseOptions>',
          description: '解析选项',
        },
        {
          flags: '-g --generator <generator>',
          description: '生成器名称',
        },
        {
          flags: '-go --generateOptions <generateOptions>',
          description: '生成选项',
        },
        {
          flags: '-o --outputer <outputer>',
          description: '输出器名称',
        },
        {
          flags: '-oo --outputOptions <outputOptions>',
          description: '输出选项',
        },
        {
          flags: '-od --outputDir <outputDir>',
          description: '输出文件夹',
        },
        {
          flags: '--overwrite',
          description: '是否覆盖源文档',
          defaultValue: false,
        },
      ],
    };
  }
}

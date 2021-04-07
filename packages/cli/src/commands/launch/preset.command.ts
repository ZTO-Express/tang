import { CliCommand } from '../../common';

export class PresetCommand implements CliCommand {
  config() {
    return {
      name: 'preset',
      args: '[name]',
      description: '插件预设相关操作',
      argsDescription: {
        name: '插件预设名称 <pluginName>[@version]:presetName',
      },
      commands: [
        {
          name: 'list',
          args: '[prefix]',
          aliases: ['l', 'ls'],
          description: '列出所有插件预设',
          argsDescription: {
            prefix: '列出的插件前缀',
          },
        },
        {
          name: 'info',
          args: '[name]',
          aliases: ['i'],
          description: '查看插件预设名称',
          argsDescription: {
            name: '插件预设名称 <pluginName>[@version]:presetName',
          },
        },
        {
          name: 'use',
          args: '[name]',
          description: '应用指定的插件或预设',
          argsDescription: {
            name: '插件或预设名称，如(openapi, openapi:default)',
          },
          options: [
            {
              flags: '-opts --options <options>',
              description: '插件预设配置信息',
            },
            {
              flags: '-od --outputDir <outputDir>',
              description: '输出文件夹',
            },
            {
              flags: '--unset',
              description: '移除正在使用的预设',
            },
          ],
        },
        {
          name: 'options',
          args: '[key] [value]',
          aliases: ['opt'],
          description: '配置预设处理器选项',
          argsDescription: {
            key: '选项路径',
            value: '选项值',
          },
          options: [
            {
              flags: '--unset',
              description: '取消指定的设置',
            },
          ],
        },
      ],
    };
  }
}

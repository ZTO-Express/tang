import { CliCommand } from '../../common';

export class UseCommand implements CliCommand {
  config() {
    return {
      name: 'use',
      args: '[name]',
      description: '应用指定的插件或预设',
      argsDescription: {
        name: '插件或预设名称，如(openapi, openapi:default)',
      },
      action: 'launch.use',
      options: [
        {
          flags: '-opts --options <options>',
          description: '插件预设配置信息',
        },
        {
          flags: '-od --outputDir <outputDir>',
          description: '输出文件夹',
        },
      ],
    };
  }
}

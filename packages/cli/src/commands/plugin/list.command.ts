import { CliCommand } from '../../common';

export class ListCommand implements CliCommand {
  config() {
    return {
      name: 'list',
      args: '[type]',
      aliases: ['ls'],
      description: '列出所有已安装插件',
      argsDescription: {
        name: '类型',
      },
      action: 'launch.list',
    };
  }
}

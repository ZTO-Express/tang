import { CliCommand } from '../../common';

export class ListCommand implements CliCommand {
  config() {
    return {
      name: 'list',
      args: '[type]',
      aliases: ['ls'],
      description: '列出相关信息',
      argsDescription: {
        name: '类型',
      },
      action: 'launch.list',
    };
  }
}

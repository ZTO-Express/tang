import { CliCommand } from '../../common';

export class DeleteCommand implements CliCommand {
  config() {
    return {
      name: 'uninstall',
      aliases: ['uni', 'delete', 'del'],
      args: '<name>',
      description: '删除指定插件',
      action: 'launch.delete',
    };
  }
}

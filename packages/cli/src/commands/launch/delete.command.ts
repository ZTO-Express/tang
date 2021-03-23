import { CliCommand } from '../../common';

export class DeleteCommand implements CliCommand {
  config() {
    return {
      name: 'delete',
      args: '<name>',
      description: '删除指定插件',
      action: 'launch.delete',
    };
  }
}

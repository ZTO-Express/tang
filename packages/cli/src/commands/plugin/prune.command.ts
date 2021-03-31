import { CliCommand } from '../../common';

export class PruneCommand implements CliCommand {
  config() {
    return {
      name: 'prune',
      description: '清理安装缓存',
      action: 'launch.prune',
    };
  }
}

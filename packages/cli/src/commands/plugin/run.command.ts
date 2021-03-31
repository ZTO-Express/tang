import { CliCommand } from '../../common';

export class RunCommand implements CliCommand {
  config() {
    return {
      name: 'run',
      args: '<name> <action>',
      description: '运行插件方法',
      options: [
        {
          flags: '--args [args...]',
          description: '执行参数',
        },
      ],
      action: 'launch.run',
    };
  }
}

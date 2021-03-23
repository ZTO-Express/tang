import { CliCommand } from '../../common';

export class InstallCommand implements CliCommand {
  config() {
    return {
      name: 'install',
      args: '<package>',
      description: '安装插件',
      argsDescription: {
        package: '插件包名或路径(类似npm install)',
      },
      action: 'launch.install',
    };
  }
}

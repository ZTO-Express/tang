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
      options: [
        {
          flags: '-f --force',
          description: '强制安装',
          defaultValue: false,
        },
        {
          flags: '-r --repository <repository>',
          description: '插件仓库',
        },
        {
          flags: '-t --type <type>',
          description: '安装方式',
          choices: ['npm', 'npm_link'],
          defaultValue: 'npm',
        },
      ],
    };
  }
}

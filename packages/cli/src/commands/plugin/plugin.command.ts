import { CliCommand } from '../../common';

export class PluginCommand implements CliCommand {
  config() {
    return {
      name: 'plugin',
      args: '<name>',
      description: '插件相关操作',
      argsDescription: {
        name: '插件名称 <name>[@version]',
      },
      commands: [
        {
          name: 'list',
          args: '[prefix]',
          aliases: ['l', 'ls'],
          description: '列出所有插件',
          argsDescription: {
            prefix: '列出的插件前缀',
          },
        },
        {
          name: 'info',
          args: '<name>',
          aliases: ['i'],
          description: '查看插件名称',
          argsDescription: {
            prefix: '插件名称',
          },
        },
        {
          name: 'install',
          args: '<package>',
          description: '安装插件',
          argsDescription: {
            package: '插件包名或路径(类似npm install)',
          },
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
        },
        {
          name: 'delete',
          args: '<name>',
          description: '删除指定插件',
        },
        {
          name: 'run',
          args: '<name> <action>',
          description: '运行插件方法',
          options: [
            {
              flags: '--args [args...]',
              description: '执行参数',
            },
          ],
        },
      ],
    };
  }
}

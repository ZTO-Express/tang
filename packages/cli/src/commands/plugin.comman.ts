import { CliCommand } from '../common';

export class ConfigCommand implements CliCommand {
  config() {
    return {
      name: 'plugin',
      args: '<key> <value>',
      description: '操作Tang配置',
      commands: [
        {
          name: 'list',
          aliases: ['l', 'ls'],
          description: '列出所有配置',
        },
        {
          name: 'open', // 默认action为config.set
          description: '打开配置文件所在位置',
        },
        {
          name: 'set', // 默认action为config.set
          flags: '<key> <value>',
          aliases: ['s'],
          description: '设置配置',
        },
        {
          name: 'unset', // 默认action为config.set
          flags: '<key>',
          description: '移除配置',
        },
      ],
    };
  }
}

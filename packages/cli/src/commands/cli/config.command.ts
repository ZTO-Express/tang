import { CliCommand } from '../../common';

export class ConfigCommand implements CliCommand {
  config() {
    return {
      name: 'config',
      args: '[key] [value]',
      aliases: ['cfg'],
      description: '操作Tang配置',
      argsDescription: {
        key: '配置key',
        value: '配置值',
      },
      commands: [
        {
          name: 'get', // 默认action为config.set
          aliases: ['list', 'ls'],
          args: '[key]',
          description: '获取指定节点下生效配置',
        },
        {
          name: 'set', // 默认action为config.set
          args: '<key> <value>',
          description: '设置配置',
        },
        {
          name: 'unset', // 默认action为config.set
          args: '<key>',
          description: '移除配置',
        },
        {
          name: 'locations', // 默认action为config.set
          aliases: ['loc', 'locs', 'location'],
          description: '显示相关配置文件位置',
        },
      ],
    };
  }
}

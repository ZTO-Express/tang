import { CliCommand } from '../common';

export class DocumentCommand implements CliCommand {
  config() {
    return {
      name: 'document',
      args: '<key> <value>',
      description: '操作文档',
      argsDescription: {
        key: '配置key',
        value: '配置值',
      },
      commands: [
        {
          name: 'list',
          aliases: ['l', 'ls'],
          description: '列出所有配置',
        },
        {
          name: 'add', // 默认action为config.set
          flags: '<key> <value>',
          aliases: ['a'],
          description: '新增配置，已存在则忽略',
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

import { Command, CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { CommandInput, CommandOptions } from './command.input';

export class ConfigCommand extends AbstractCommand {
  load(program: CommanderStatic) {
    program
      .command('config [name] [value]')
      .alias('cfg')
      .description('操作Tang配置信息')
      .option('--unset', '列出当前所有配置项')
      .option('-l, --list', '列出当前所有配置项')
      .action(async (name: string, value: string, command: Command) => {
        const inputs: CommandInput[] = [];
        inputs.push({ name: 'unset', value: command.unset });
        inputs.push({ name: 'list', value: command.list });

        const options: CommandOptions = {
          name,
          value,
        };

        await this.action.handle({ inputs, options });
      });
  }
}

import { Command, CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { CommandOptions } from './command.input';

export class UpdateCommand extends AbstractCommand {
  load(program: CommanderStatic) {
    program
      .command('update')
      .alias('u')
      .description('Update Tang dependencies.')
      .option(
        '-f, --force',
        'Remove and re-install dependencies (instead of update).',
      )
      .option(
        '-t, --tag <tag>',
        'Upgrade to tagged packages (latest | beta | rc | next tag).',
      )
      .action(async (command: Command) => {
        const options: CommandOptions = {
          force: !!command.force,
          tag: command.tag,
        };

        await this.action.handle({ options });
      });
  }
}

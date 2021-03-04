import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';

export class InfoCommand extends AbstractCommand {
  load(program: CommanderStatic) {
    program
      .command('info')
      .alias('i')
      .description('Display Tang details.')
      .action(async () => {
        await this.action.handle();
      });
  }
}

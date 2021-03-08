import * as commander from 'commander';
import { CliActionFn, CliCommand, CliCommandOptions } from '../common';

export class UpdateCommand implements CliCommand {
  constructor(private readonly actionFn: CliActionFn) {}

  load(program: commander.Command) {
    return program
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
      .action(async (opts: any, command: commander.Command) => {
        const options: CliCommandOptions = {
          force: !!opts.force,
          tag: opts.tag,
        };

        await this.actionFn({ options });
      });
  }
}

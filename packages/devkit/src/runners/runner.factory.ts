import { cli } from '../utils';
import { GitRunner } from './git.runner';
import { NpmRunner } from './npm.runner';
import { YarnRunner } from './yarn.runner';

export enum Runner {
  GIT,
  NPM,
  YARN,
}

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();

      case Runner.GIT:
        return new GitRunner();

      default:
        console.info(cli.chalk.yellow(`[WARN] Unsupported runner: ${runner}`));
        return undefined;
    }
  }
}

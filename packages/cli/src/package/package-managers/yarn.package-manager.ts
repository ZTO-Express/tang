import { PackageManagerCommands } from '../../common/interfaces';
import { Runner, RunnerFactory } from '@tang/devkit/src/runners';
import { YarnRunner } from '@tang/devkit/src/runners/yarn.runner';
import {
  PackageManagers,
  AbstractPackageManager,
} from './abstract.package-manager';

export class YarnPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.YARN) as YarnRunner);
  }

  public get name() {
    return PackageManagers.YARN.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'add',
      update: 'upgrade',
      remove: 'remove',
      saveFlag: '',
      saveDevFlag: '-D',
    };
  }
}

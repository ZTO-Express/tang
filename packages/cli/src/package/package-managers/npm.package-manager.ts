import { PackageManagerCommands } from '../../common';
import { Runner, RunnerFactory } from '@tang/devkit/src/runners';
import { NpmRunner } from '@tang/devkit/src/runners/npm.runner';
import {
  PackageManagers,
  AbstractPackageManager,
} from './abstract.package-manager';

export class NpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.NPM) as NpmRunner);
  }

  public get name() {
    return PackageManagers.NPM.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'install',
      update: 'update',
      remove: 'uninstall',
      saveFlag: '--save',
      saveDevFlag: '--save-dev',
    };
  }
}

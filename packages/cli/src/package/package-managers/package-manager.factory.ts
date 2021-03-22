import * as devkit from '@devs-tang/devkit';
import {
  PackageManagers,
  AbstractPackageManager,
} from './abstract.package-manager';
import { NpmPackageManager } from './npm.package-manager';
import { YarnPackageManager } from './yarn.package-manager';

export class PackageManagerFactory {
  static create(name: PackageManagers | string): AbstractPackageManager {
    switch (name) {
      case PackageManagers.NPM:
        return new NpmPackageManager();
      case PackageManagers.YARN:
        return new YarnPackageManager();
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }

  static async find(): Promise<AbstractPackageManager> {
    try {
      const files = await devkit.fs.readdir(process.cwd());
      if (files.includes('yarn.lock')) {
        return this.create(PackageManagers.YARN);
      } else {
        return this.create(PackageManagers.NPM);
      }
    } catch {
      return this.create(PackageManagers.NPM);
    }
  }
}

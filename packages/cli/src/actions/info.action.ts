import * as chalk from 'chalk';
import { platform, release } from 'os';
import osName = require('os-name');
import { AbstractPackageManager, PackageManagerFactory } from '../package';
import { BANNER } from '../ui';
import { CliAction } from '../common';

export class InfoAction implements CliAction {
  async main() {
    displayBanner();
    await displaySystemInformation();
    await displayTangInformation();
  }
}

const displayBanner = () => {
  console.info(chalk.red(BANNER));
};

const displaySystemInformation = async () => {
  console.info(chalk.green('[System Information]'));
  console.info('OS Version     :', chalk.blue(osName(platform(), release())));
  console.info('NodeJS Version :', chalk.blue(process.version));
  await displayPackageManagerVersion();
};

const displayPackageManagerVersion = async () => {
  const manager: AbstractPackageManager = await PackageManagerFactory.find();
  try {
    const version: string = await manager.version();
    console.info(`${manager.name} Version    :`, chalk.blue(version), '\n');
  } catch {
    console.error(`${manager.name} Version    :`, chalk.red('Unknown'), '\n');
  }
};

const displayTangInformation = async () => {
  displayCliVersion();
  console.info(chalk.green('[Tang Platform Information]'));

  // 读取插件以及预设信息
};

const displayCliVersion = () => {
  console.info(chalk.green('[Tang CLI]'));
  console.info(
    'Tang CLI Version :',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    chalk.blue(require('../../package.json').version),
    '\n',
  );
};

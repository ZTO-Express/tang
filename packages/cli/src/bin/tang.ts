#!/usr/bin/env node
import * as commander from 'commander';
import { CommanderStatic } from 'commander';
import { CommandLoader } from '../commands';

import {
  loadLocalBinCommandLoader,
  localBinExists,
} from '../lib/utils/local-binaries';

const bootstrap = () => {
  const program: CommanderStatic = commander;
  program
    .version(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../package.json').version,
      '-v, --version',
      '输出当前目录.',
    )
    .usage('<command> [options]')
    .helpOption('-h, --help', '查看帮助信息.');

  if (localBinExists()) {
    const localCommandLoader = loadLocalBinCommandLoader();
    localCommandLoader.load(program);
  } else {
    CommandLoader.load(program);
  }

  // TODO 添加钩子回调

  commander.parse(process.argv);

  // TODO 添加钩子回调

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

bootstrap();

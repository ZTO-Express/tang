import * as devkit from '@devs-tang/devkit';
import { join, posix } from 'path';
import { CommandLoader } from '../entry';

const localBinPathSegments = [process.cwd(), 'node_modules', '@tang', 'cli'];

export function localBinExists() {
  return devkit.fs.existsSync(join(...localBinPathSegments));
}

export function loadLocalBinCommandLoader(): typeof CommandLoader {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandsFile = require(posix.join(...localBinPathSegments, 'commands'));
  return commandsFile.CommandLoader;
}

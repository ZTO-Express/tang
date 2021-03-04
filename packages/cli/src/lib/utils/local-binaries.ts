import { util as tangUtil } from '@tang/tang';
import { join, posix } from 'path';
import { CommandLoader } from '../../commands';

const localBinPathSegments = [process.cwd(), 'node_modules', '@tang', 'cli'];

export function localBinExists() {
  return tangUtil.fs.existsSync(join(...localBinPathSegments));
}

export function loadLocalBinCommandLoader(): typeof CommandLoader {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandsFile = require(posix.join(...localBinPathSegments, 'commands'));
  return commandsFile.CommandLoader;
}

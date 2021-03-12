import * as path from 'path';
import * as os from 'os';

import { fs } from '../src/utils';

export { fs };

export const appRescBaseUrl = 'http://resc.pisaas.com/apps/tang';
export const appHomeDir = `${os.homedir}/.tang`;

/** 获取fixture位置 */
export function resolveFixturePath(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args);
}

/** 获取fixture url位置 */
export function resolveFixtureUrl(...args: string[]) {
  const pathUrl = path.join(...args);
  const urlStr = appRescBaseUrl + '/fixtures/' + pathUrl;
  return urlStr;
}

/** 获取测试输出目录，位于tang的应用目录下 */
export function resolveTmpDir(...args: string[]) {
  const tmpDir = path.join(appHomeDir, 'test_output/cli', ...args);
  fs.ensureDirSync(tmpDir);
  return tmpDir;
}

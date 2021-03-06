import * as path from 'path';
import * as os from 'os';

import * as processors from '../src/processors';

import { fs } from '../src/utils';
import { GenericConfigObject } from '@tang/common';
import { Compiler, getNormalizedOptions } from '@tang/core';

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

/** 创建默认编译器 */
export function createDefaultCompiler(options?: GenericConfigObject) {
  options = Object.assign({}, options);
  options.loaders = [
    ...((options.loaders as any) || []),
    processors.localLoader(),
  ];
  options.parsers = [
    ...((options.parsers as any) || []),
    processors.json5Parser(),
    processors.yamlParser(),
  ];
  options.generators = [
    ...((options.generators as any) || []),
    processors.yamlGenerator(),
  ];
  options.outputers = [
    ...((options.outputers as any) || []),
    processors.localOutputer(),
    processors.memoryOutputer(),
  ];

  const opts = getNormalizedOptions(options);

  const compiler = new Compiler(opts);
  return compiler;
}

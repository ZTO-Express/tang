import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as devkit from '@tang/devkit';

import { GenericConfigObject } from '@tang/common';
import { getNormalizedOptions } from '../src/options/normalize-options';
import { Compiler } from '../src/compiler';

export const appRescBaseUrl = 'http://resc.pisaas.com/apps/tang';
export const appHomeDir = `${os.homedir}/.tang`;

/** 获取测试输出目录，位于tang的应用目录下 */
export function resolveTmpDir(...args: string[]) {
  const tmpDir = path.join(appHomeDir, 'test_output', ...args);
  fs.ensureDirSync(tmpDir);
  return tmpDir;
}

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

export const docLoader = devkit.docLoader;

export const yamlParser = devkit.yamlParser;

export const yamlGenerator = devkit.yamlGenerator;

export const localOutputer = devkit.localOutputer;

export const memoryOutputer = devkit.memoryOutputer;

/** 创建默认编译器 */
export function createDefaultCompiler(options?: GenericConfigObject) {
  options = Object.assign({}, options);
  options.loaders = [...((options.loaders as any) || []), docLoader()];
  options.parsers = [...((options.parsers as any) || []), yamlParser()];
  options.generators = [
    ...((options.generators as any) || []),
    yamlGenerator(),
  ];
  options.outputers = [
    ...((options.outputers as any) || []),
    localOutputer(),
    memoryOutputer(),
  ];

  const opts = getNormalizedOptions(options);

  const compiler = new Compiler(opts);
  return compiler;
}

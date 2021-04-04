import * as path from 'path';
import * as os from 'os';

import { GenericConfigObject } from '@devs-tang/common';
import { Compiler, getNormalizedOptions } from '@devs-tang/core';

import * as processors from '../src/processors';

import { fs } from '../src/utils';
import { TangLauncher } from '../src';

export { fs };

export const appRescBaseUrl = 'http://resc.pisaas.com/apps/tang';
export const appHomeDir = `${os.homedir}/.tang`;

/** 当前package.json文件 */
export function resolvePackagePath(isFilePath = true) {
  const packageDir = path.join(__dirname, '../');
  if (!isFilePath) return packageDir;
  return path.join(packageDir, 'package.json');
}

/** 获取fixture位置 */
export function resolveFixturePath(...args: string[]) {
  return path.join(__dirname, '../../fixtures', ...args);
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

/** 清理测试换行 */
export async function cleanTangLauncherTestEnv() {
  const launcher = await TangLauncher.getInstance();
  const { pluginManager } = launcher;

  // 删除所有插件
  await fs.remove(pluginManager.pluginDir);

  // 清理缓存及无效插件、预设
  await launcher.prune();
}

/** 创建默认编译器 */
export function createDefaultCompiler(options?: GenericConfigObject) {
  options = Object.assign({}, options);
  options.loaders = [
    ...((options.loaders as any) || []),
    processors.docLoader(),
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

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';

import {
  GenericConfigObject,
  TangGeneration,
  TangLoader,
  TangOutput,
  TangOutputer,
  utils,
} from '@tang/common';
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

export const localOutputer = (): TangOutputer => {
  return {
    type: 'outputer',
    name: 'local',
    async output(
      generation: TangGeneration,
      options?: GenericConfigObject,
    ): Promise<TangOutput> {
      const files = generation.chunks.map(it => it.name);
      return {
        result: true,
        files,
      };
    },
  };
};

export const memoryOutputer = (): TangOutputer => {
  return {
    type: 'outputer',
    name: 'memory',
    async output(generation: TangGeneration): Promise<TangOutput> {
      const files = generation.chunks.map(it => it.name);
      return {
        result: true,
        files,
      };
    },
  };
};

// 测试localLoader
export const localLoader = (): TangLoader => {
  return {
    type: 'loader',
    name: 'local',
    test: (entry: string) => utils.isAbsolutePath(entry),
    async load(
      entry: string,
      options: GenericConfigObject = {},
    ): Promise<string | Buffer> {
      const buffer = await fs.readFile(entry, options);
      const text = buffer.toString();
      return text;
    },
  };
};

/** 创建默认编译器 */
export function createDefaultCompiler(options?: GenericConfigObject) {
  options = Object.assign({}, options);
  options.loaders = [...((options.loaders as any) || []), localLoader()];
  options.outputers = [
    ...((options.outputers as any) || []),
    localOutputer(),
    memoryOutputer(),
  ];

  const opts = getNormalizedOptions(options);

  const compiler = new Compiler(opts);
  return compiler;
}

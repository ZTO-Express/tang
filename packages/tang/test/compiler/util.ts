import * as path from 'path';
import * as os from 'os';

import { fs } from '../src/utils';
import * as loader from '../src/loader';
import * as parser from '../src/parser';
import * as generator from '../src/generator';
import * as outputer from '../src/outputer';
import { Compiler } from '../src/compiler';

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
  const tmpDir = path.join(appHomeDir, 'test_output', ...args);
  fs.ensureDirSync(tmpDir);
  return tmpDir;
}

/** 本地输出 */
export function getAllProcessors() {
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  const jsonGenerator = generator.jsonGenerator();
  const yamlGenerator = generator.yamlGenerator();

  const localOutputer = outputer.localOutputer();
  const memoryOutputer = outputer.memoryOutputer();

  return {
    loaders: [urlLoader, localLoader],
    parsers: [jsonParser, yamlParser],
    generators: [jsonGenerator, yamlGenerator],
    outputers: [localOutputer, memoryOutputer],
  };
}

/** 创建默认编译器 */
export function createDefaultCompiler(...args: any[]) {
  const processors = getAllProcessors();

  const opts: any = Object.assign({ ...processors }, ...args);

  const compiler = new Compiler(opts);
  return compiler;
}

import * as testUtil from '../util';
import { DefaultTangCompiler } from '@devs-tang/core';
import * as processors from '../../src/processors';

describe('generator/code：code生成器', () => {
  const origCwd = process.cwd; //保存初始cwd

  const codeGenerator = processors.codeGenerator();

  it('normalize方法', async () => {
    const compiler: DefaultTangCompiler = testUtil.createDefaultCompiler();
  });
});

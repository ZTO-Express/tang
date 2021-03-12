import * as testUtil from '../util';
import { Compiler } from '../../src/compiler';

import * as processors from '../../src/processors';

describe('compiler/generator：获取生成器 getGenerator', () => {
  const jsonGenerator = processors.jsonGenerator();
  const yamlGenerator = processors.yamlGenerator();

  let compiler1: Compiler;
  let compiler2: Compiler;

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      generators: [jsonGenerator, yamlGenerator],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultGenerator: 'yaml',
      generators: [jsonGenerator, yamlGenerator],
    });
  });

  it('验证 getGenerator by name', async () => {
    const generator = compiler1.getGenerator({ generator: 'yaml' });
    expect(generator).not.toBe(yamlGenerator);
    expect(generator.name).toBe(yamlGenerator.name);
    expect(generator.generate).toBe(yamlGenerator.generate);

    expect(compiler1.getGenerator({ generator: 'xxx' })).toBeUndefined();
  });

  it('验证 getGenerator by instance', async () => {
    const generator = compiler1.getGenerator({ generator: jsonGenerator });

    expect(generator).not.toBe(jsonGenerator);
    expect(generator.name).toBe(jsonGenerator.name);
    expect(generator.generate).toBe(jsonGenerator.generate);
  });

  it('验证 getGenerator by default', async () => {
    expect(compiler1.getGenerator({}).name).toBe(jsonGenerator.name);
    expect(compiler2.getGenerator({}).name).toBe(yamlGenerator.name);
  });

  it('验证 getGenerator Options', async () => {
    const generateOptions = {
      a1: 'a.1',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        aaa: { a111: 'a.1.1', a11x: 'a.1.x1' },
      },
    };

    const generateOptions2 = {
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a13: 'a.1.3',
        aaa: { a111: 'a.1.1', a112: 'a.1.2', a11x: 'a.1.x2' },
      },
    };

    const generator = compiler1.getGenerator({
      generateOptions,
    });

    expect(generator.generateOptions).not.toBe(generateOptions);
    expect(generator.generateOptions).toStrictEqual(generateOptions);

    const generator2 = compiler1.getGenerator({
      generator: generator,
      generateOptions: generateOptions2,
    });

    expect(generator2.generateOptions).toStrictEqual({
      a1: 'a.1',
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        a13: 'a.1.3',
        aaa: {
          a111: 'a.1.1',
          a112: 'a.1.2',
          a11x: 'a.1.x2',
        },
      },
    });
  });
});

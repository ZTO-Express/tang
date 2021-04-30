import * as testUtil from '../util';
import { DefaultTangCompiler } from '../../src';

describe('compiler/outputer：获取输出器 getOutputer', () => {
  const mockCompilation = { entry: 'mock' };

  const localOutputer = testUtil.localOutputer();
  const memoryOutputer = testUtil.memoryOutputer();

  let compiler1: DefaultTangCompiler;
  let compiler2: DefaultTangCompiler;

  beforeAll(() => {
    compiler1 = testUtil.createDefaultCompiler({
      outputers: [localOutputer, memoryOutputer],
    });

    compiler2 = testUtil.createDefaultCompiler({
      defaultOutputer: 'memory',
      outputers: [localOutputer, memoryOutputer],
    });
  });

  it('验证 getOutputer by name', async () => {
    const outputer = compiler1.getOutputer(mockCompilation, {
      outputer: 'memory',
    });
    expect(outputer).not.toBe(memoryOutputer);
    expect(outputer.name).toBe(memoryOutputer.name);
    expect(outputer.output).toBe(memoryOutputer.output);

    expect(
      compiler1.getOutputer(mockCompilation, { outputer: 'xxx' }),
    ).toBeUndefined();
  });

  it('验证 getOutputer by instance', async () => {
    const outputer = compiler1.getOutputer(mockCompilation, {
      outputer: localOutputer,
    });

    expect(outputer).not.toBe(localOutputer);
    expect(outputer.name).toBe(localOutputer.name);
    expect(outputer.output).toBe(localOutputer.output);
  });

  it('验证 getOutputer by default', async () => {
    expect(compiler1.getOutputer(mockCompilation).name).toBe(
      localOutputer.name,
    );
    expect(compiler2.getOutputer(mockCompilation).name).toBe(
      memoryOutputer.name,
    );
  });

  it('验证 getOutputer Options', async () => {
    const outputOptions = {
      a1: 'a.1',
      aa: {
        a11: 'a.1.1',
        a12: 'a.1.2',
        aaa: { a111: 'a.1.1', a11x: 'a.1.x1' },
      },
    };

    const outputOptions2 = {
      a2: 'a.2',
      aa: {
        a11: 'a.1.1',
        a13: 'a.1.3',
        aaa: { a111: 'a.1.1', a112: 'a.1.2', a11x: 'a.1.x2' },
      },
    };

    const outputer = compiler1.getOutputer(mockCompilation, {
      outputOptions,
    });

    expect(outputer.outputOptions).not.toBe(outputOptions);
    expect(outputer.outputOptions).toStrictEqual(outputOptions);

    const outputer2 = compiler1.getOutputer(mockCompilation, {
      outputer: outputer,
      outputOptions: outputOptions2,
    });

    expect(outputer2.outputOptions).toStrictEqual({
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

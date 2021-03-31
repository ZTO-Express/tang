import * as testUtil from '../util';
import { Chunk } from '@devs-tang/common';
import * as processors from '../../src/processors';

describe('outputer/console：console输出器', () => {
  const consoleOutputer = processors.consoleOutputer();
  const compiler = testUtil.createDefaultCompiler();

  let samplePresetData: any;
  let sampleChunks: Chunk[];

  beforeAll(async () => {
    const yfDocPath = testUtil.resolveFixturePath('mesh.json');
    const presetGeneration = await compiler.load(yfDocPath);
    samplePresetData = presetGeneration.document.model;

    sampleChunks = [
      {
        name: '/mesh.json',
        content: samplePresetData && JSON.stringify(samplePresetData),
      },
      {
        name: '/blank.json',
        content: '',
      },
    ];
  });

  it('consoleOutputer output方法', async () => {
    const output = await consoleOutputer.output({
      chunks: sampleChunks,
    } as any);

    expect(output.result).toBe(true);
    expect(output.files.length).toBe(2);

    const output2 = await consoleOutputer.output({} as any);

    expect(output2.result).toBe(true);
    expect(output2.files.length).toBe(0);
  });
});

import * as testUtil from '../util';
import { Chunk } from '@devs-tang/common';
import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src/processors';
import { memfs, json5 } from '../../src/utils';

describe('outputer/memory：memory输出器', () => {
  const memoryOutputer = processors.memoryOutputer();
  const compiler = testUtil.createDefaultCompiler();

  let samplePresetData: any;
  let sampleChunks: Chunk[];

  beforeAll(async () => {
    const yfDocPath = testUtil.resolveFixturePath(
      'meshs/yapi-fsharing/mesh.json',
    );

    const presetGeneration = await compiler.load(yfDocPath);

    samplePresetData = presetGeneration.document.model;

    sampleChunks = [
      {
        name: '/mesh.json',
        content: JSON.stringify(samplePresetData),
      },
      {
        name: '/blank.json',
        content: '',
      },
    ];
  });

  it('normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'memory',
          output: memoryOutputer.output,
        },
        {
          type: 'outputer',
          moduleType: 'devkit',
        },
      ),
    ).toEqual(memoryOutputer);
  });

  it('memoryOutputer output方法', async () => {
    const output = await memoryOutputer.output({
      chunks: sampleChunks,
    } as any);

    expect(output.result).toBe(true);
    expect(output.files.length).toBe(1);

    const files: any[] = output.files;
    const vol = output.vol as memfs.IFs;

    const testBuffer = await vol.promises.readFile(files[0].path, {});
    const testData = json5.parse(testBuffer.toString());

    expect(testData.name).toStrictEqual('tang-yapi-sharing');
    expect(testData).toStrictEqual(samplePresetData);
  });
});

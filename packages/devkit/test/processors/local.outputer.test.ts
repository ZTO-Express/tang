import * as testUtil from '../util';
import { fs } from '../../src/utils';
import { Chunk } from '@devs-tang/common';
import { normalizeProcessor } from '@devs-tang/core';
import * as processors from '../../src/processors';

describe('outputer/local：local输出器', () => {
  const localOutputer = processors.localOutputer();
  const compiler = testUtil.createDefaultCompiler();
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  let samplePresetData: any;
  let sampleChunks: Chunk[];

  beforeAll(async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'meshs/yapi-fsharing/mesh.json',
    );

    const presetGeneration = await compiler.load(yfPresetPath);

    samplePresetData = presetGeneration.document.model;

    sampleChunks = [
      {
        name: 'mesh.json',
        content: JSON.stringify(samplePresetData),
      },
      {
        name: 'blank.json',
        content: '',
      },
    ];
  });

  it('normalize方法', async () => {
    expect(
      normalizeProcessor(
        {
          name: 'local',
          output: localOutputer.output,
        },
        {
          type: 'outputer',
          moduleType: 'devkit',
        },
      ),
    ).toEqual(localOutputer);
  });

  it('localOutputer output方法', async () => {
    await fs.emptyDir(testTmpDir);

    const sampleGeneration = {
      document: {},
      chunks: sampleChunks,
    } as any;

    let output = await localOutputer.output(sampleGeneration, {
      outputDir: testTmpDir,
      overwrite: true,
    });

    expect(output.result).toBe(true);
    expect(output.files.length).toBe(1);

    const files: any[] = output.files;

    const testData = await fs.readJSON(files[0].path);

    expect(testData.name).toStrictEqual('tang-yapi-sharing');
    expect(testData).toStrictEqual(samplePresetData);

    output = await localOutputer.output(sampleGeneration, {
      outputDir: testTmpDir,
      clearDir: false,
      overwrite: false,
    });
    expect(output.files.length).toBe(0);

    output = await localOutputer.output(sampleGeneration, {
      outputDir: testTmpDir,
      clearDir: false,
      overwrite: true,
    });
    expect(output.files.length).toBe(1);

    output = await localOutputer.output(sampleGeneration, {
      outputDir: testTmpDir,
      clearDir: true,
      overwrite: false,
    });
    expect(output.files.length).toBe(1);

    await expect(localOutputer.output(sampleGeneration, {})).rejects.toThrow(
      '请提供输出目录',
    );

    await fs.emptyDir(testTmpDir);
  });
});

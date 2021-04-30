import * as testUtil from '../util';
import { TangChunk } from '@devs-tang/common';
import { normalizeProcessor } from '@devs-tang/core';
import { fs } from '../../src/utils';
import * as processors from '../../src/processors';

describe('outputer/local：local输出器', () => {
  const localOutputer = processors.localOutputer();
  const compiler = testUtil.createDefaultCompiler();
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  let samplePresetData: any;
  let sampleChunks: TangChunk[];

  beforeAll(async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'meshs/yapi-fsharing/mesh.json',
    );

    const presetGeneration = await compiler.load(yfPresetPath);

    samplePresetData = presetGeneration.document.model;

    sampleChunks = [
      {
        name: 'test_mesh.json',
        content: JSON.stringify(samplePresetData),
      },
      {
        name: 'test_blank.json',
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
      overwrite: false,
    });
    expect(output.files.length).toBe(0);

    output = await localOutputer.output(sampleGeneration, {
      outputDir: testTmpDir,
      overwrite: true,
    });
    expect(output.files.length).toBe(1);

    output = await localOutputer.output(sampleGeneration, {});

    expect(output.options).toEqual({
      outputDir: process.cwd(),
      overwrite: false,
    });

    output = await localOutputer.output(sampleGeneration);
    expect(output.options).toEqual({
      outputDir: process.cwd(),
      overwrite: false,
    });

    await fs.remove(fs.joinPath(process.cwd(), sampleChunks[0].name));

    await fs.writeFile(fs.joinPath(testTmpDir, 'test1.json'), 'test1');

    output = await localOutputer.output(
      {
        entry: '',
        chunks: [
          {
            name: 'test1.json',
            content: 'test1',
          },
          {
            name: 'test3.json',
            content: 'test3',
          },
        ],
      },
      {
        outputDir: testTmpDir,
      },
    );

    expect(output.files).toEqual([
      {
        name: 'test3.json',
        content: 'test3',
        path: fs.joinPath(testTmpDir, 'test3.json'),
      },
    ]);

    await fs.emptyDir(testTmpDir);
  });
});

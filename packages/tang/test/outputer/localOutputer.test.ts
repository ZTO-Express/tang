import * as testUtil from '../util';
import { fs } from '../../src/utils';
import { TangChunk } from '../../src/common/types';
import * as outputer from '../../src/outputer';

describe('outputer/local：local输出器', () => {
  const localOutputer = outputer.localOutputer();
  const compiler = testUtil.createDefaultCompiler();
  const testTmpDir = testUtil.resolveTmpDir('localOutputer');

  let samplePresetData: any;
  let sampleChunks: TangChunk[];

  beforeAll(async () => {
    const yfPresetPath = testUtil.resolveFixturePath(
      'presets/yapi-fsharing/preset.json',
    );

    const presetGeneration = await compiler.load(yfPresetPath);

    samplePresetData = presetGeneration.document.model;

    sampleChunks = [
      {
        name: 'preset.json',
        content: JSON.stringify(samplePresetData),
      },
      {
        name: 'blank.json',
        content: '',
      },
    ];
  });

  it('localOutputer output方法', async () => {
    await fs.emptyDir(testTmpDir);

    await expect(
      localOutputer.output({ chunks: sampleChunks }, {}),
    ).rejects.toThrow('请提供输出目录');

    const output = await localOutputer.output(
      {
        chunks: sampleChunks,
      },
      {
        outputDir: testTmpDir,
        overwrite: true,
      },
    );

    expect(output.result).toBe(true);
    expect(output.files.length).toBe(1);

    const files: any[] = output.files;

    const testData = await fs.readJSON(files[0].path);

    expect(testData.name).toStrictEqual('@tang/yapi-sharing');
    expect(testData).toStrictEqual(samplePresetData);

    const output2 = await localOutputer.output(
      {
        chunks: sampleChunks,
      },
      {
        outputDir: testTmpDir,
        clearDir: true,
        overwrite: false,
      },
    );
    expect(output2.files.length).toBe(0);

    await fs.emptyDir(testTmpDir);
  });
});

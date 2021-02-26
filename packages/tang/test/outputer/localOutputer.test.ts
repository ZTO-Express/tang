import * as testUtil from '../util';
import { fs } from '../../src/utils';
import { TangChunk } from '../../src/common/types';
import * as outputer from '../../src/outputer';

describe('outputer/local：local加载器', () => {
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
    ];
  });

  it('localOutputer load方法', async () => {
    const output = await localOutputer.output(
      {
        chunks: sampleChunks,
      },
      {
        outputDir: testTmpDir,
        clearDir: true,
        overwrite: true,
      },
    );

    expect(output.result).toBe(true);

    const files: any[] = output.files;

    const testData = await fs.readJSON(files[0].path);

    expect(testData.name).toStrictEqual('@tang/yapi-sharing');
    expect(testData).toStrictEqual(samplePresetData);

    await fs.emptyDir(testTmpDir);
  });
});

import * as testUtil from '../../util';

import * as commander from 'commander';
import { CommandLoader } from '../../../src/entry';

describe('tang-cli/commands：generate', () => {
  const testTmpDir = testUtil.resolveTmpDir();
  const program = commander.createCommand();

  beforeAll(async () => {
    CommandLoader.load(program);
  });

  it('generate json5', async () => {
    const docUrl = testUtil.resolveFixtureUrl(
      'presets/yapi-fsharing/preset.v1.json',
    );

    const testTmpDirStr = testTmpDir;

    const rawInfoArgs = [
      'node',
      'tang',
      'generate',
      docUrl,
      '--outputDir=' + testTmpDirStr,
    ];

    await program.parseAsync(rawInfoArgs);
  });

  it('generate inspect', async () => {
    const rawInfoArgs = [
      'node',
      'tang',
      'generate',
      'testFile.json',
      '--inspect',
    ];

    await program.parseAsync(rawInfoArgs);
  });

  it('generate with openapi-gen', async () => {
    const docPath = testUtil.resolveFixturePath('guitar.yaml');

    const testTmpDirStr = testTmpDir;

    const rawInfoArgs = [
      'node',
      'tang',
      'generate',
      docPath,
      '--outputDir=' + testTmpDirStr,
    ];

    await program.parseAsync(rawInfoArgs);
  });
});

import * as testUtil from '../util';

import * as commander from 'commander';
import { CommandLoader } from '../../src/commands';

describe('@tang/cli/commands：generate', () => {
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
});

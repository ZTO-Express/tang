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

  it('generate yaml 2 json', async () => {
    const rawInfoArgs = [
      'node',
      'tang',
      'generate',
      'http://resc.pisaas.com/apps/tang/fixtures/documents/guitar.yaml',
      '--parser=yaml',
      '--generator=json',
      '--outputer=local',
    ];

    await program.parseAsync(rawInfoArgs);
  });

  it('generate inspect', async () => {
    const rawInfoArgs = [
      'node',
      'tang',
      'generate',
      'http://resc.pisaas.com/apps/tang/fixtures/documents/guitar.yaml',
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

  it('generate use preset', async () => {
    const rawInfoArgs = [
      'node',
      'tang',
      'gen',
      '.',
      '--preset=zf-gen:ts',
      '--overwrite',
    ];

    await program.parseAsync(rawInfoArgs);
  });
});

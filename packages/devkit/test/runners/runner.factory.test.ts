import { RunnerFactory } from '../../src';

import * as execa from 'execa';

describe('runners/runner：运行器工厂', () => {
  it('execa npm', async () => {
    const results = await execa('npm', ['--version']);
    expect(results.stdout).toContain('.');
  });

  it('RunnerFactory create', async () => {
    expect(RunnerFactory.create('nonExist' as any)).toBeUndefined();
  });
});

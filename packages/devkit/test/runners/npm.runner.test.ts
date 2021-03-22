import { NpmRunner } from '../../src';

describe('runners/npm.runner：npm运行器', () => {
  it('npm --version', async () => {
    const npmRunner = new NpmRunner();
    const version = await npmRunner.run('--version', true);

    expect(version).toContain('.');
  });
});

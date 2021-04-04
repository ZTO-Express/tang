import { RunnerFactory, Runner } from '../../src';

describe('runners/yarn.runner：yarn运行器', () => {
  const yarnRunner = RunnerFactory.create(Runner.YARN);

  it('yarn --help', async () => {
    const version = await yarnRunner.run('--help', true);

    expect(version).toContain('yarn');
  });
});

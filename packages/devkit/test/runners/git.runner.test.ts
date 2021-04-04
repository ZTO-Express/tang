import { RunnerFactory, Runner } from '../../src';

describe('runners/git.runner：git运行器', () => {
  const gitRunner = RunnerFactory.create(Runner.GIT);

  it('git --help', async () => {
    const version = await gitRunner.run('--help', true);

    expect(version).toContain('git');
  });
});

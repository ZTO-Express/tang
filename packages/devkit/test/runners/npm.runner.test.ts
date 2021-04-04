import { RunnerFactory, Runner } from '../../src';

describe('runners/npm.runner：npm运行器', () => {
  const npmRunner = RunnerFactory.create(Runner.NPM);

  it('npm --help', async () => {
    let result = await npmRunner.run('--help version', true);
    expect(result).toContain('npm version');

    result = await npmRunner.run('--help version');
    expect(result).toBeUndefined();
  });

  it('npm bad Command', async () => {
    await expect(npmRunner.run('badCommand', true)).rejects.toThrow(
      'Command failed with exit code',
    );

    await expect(npmRunner.run('badCommand')).rejects.toThrow(
      'Command failed with exit code',
    );
  });
});
function NPM(NPM: any) {
  throw new Error('Function not implemented.');
}

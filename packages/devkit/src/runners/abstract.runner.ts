import * as execa from 'execa';

export class AbstractRunner {
  constructor(protected binary: string, protected args: string[] = []) {}

  public async run(
    command: string,
    collect = false,
    cwd: string = process.cwd(),
  ): Promise<null | string> {
    const args: string[] = [command];

    const options: execa.Options = {
      cwd,
      stdio: collect ? 'pipe' : 'inherit',
      shell: true,
    };

    const results = await execa(this.binary, [...this.args, ...args], options);

    if (results.exitCode !== 0) {
      throw new Error(`\nFailed to execute command: ${this.binary} ${command}`);
    } else {
      return results.stdout;
    }
  }
}

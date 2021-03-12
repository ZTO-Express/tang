import { ChildProcess, spawn, SpawnOptions } from 'child_process';

export class AbstractRunner {
  constructor(protected binary: string, protected args: string[] = []) {}

  public async run(
    command: string,
    collect = false,
    cwd: string = process.cwd(),
  ): Promise<null | string> {
    const args: string[] = [command];
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? 'pipe' : 'inherit',
      shell: true,
    };
    return new Promise<null | string>((resolve, reject) => {
      const child: ChildProcess = spawn(
        `${this.binary}`,
        [...this.args, ...args],
        options,
      );
      if (collect) {
        child.stdout!.on('data', data =>
          resolve(data.toString().replace(/\r\n|\n/, '')),
        );
      }
      child.on('close', code => {
        if (code === 0) {
          resolve(null);
        } else {
          reject(`\nFailed to execute command: ${this.binary} ${command}`);
        }
      });
    });
  }
}

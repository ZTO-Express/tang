import * as testUtil from '../util';
import { AbstractRunner } from '../../src';

import * as execa from 'execa';

describe('runners/runner：运行器', () => {
  it('execa npm', async () => {
    const results = await execa('npm', ['--version']);

    expect(results.stdout).toContain('.');
  });
});

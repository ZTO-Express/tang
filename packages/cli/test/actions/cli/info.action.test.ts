import { InfoAction } from '../../../src/actions';

describe('tang-cli/info-actions：config', () => {
  const infoAction = new InfoAction();

  it('info action', async () => {
    await infoAction.main();
  });
});

import { parseProcessorName } from '../../src/processors';

describe('tang：processor util', () => {
  it('parseProcessorName', async () => {
    expect(parseProcessorName(undefined)).toBe(undefined);
    expect(parseProcessorName('test')).toEqual({ name: 'test' });
    expect(parseProcessorName('core:test')).toEqual({
      pluginName: 'core',
      name: 'test',
    });

    expect(parseProcessorName('core:loader:test')).toEqual({
      pluginName: 'core',
      type: 'loader',
      name: 'test',
      code: 'core:loader:test',
    });

    expect(parseProcessorName({} as any)).toBe(undefined);
  });
});

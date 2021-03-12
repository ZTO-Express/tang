/** util test的测试方法 */
import * as utilTest from './util';

describe('index：默认测试方法', () => {
  const mockGeneration = {
    document: { entry: '', content: '', model: {} },
    chunks: [{ name: 'test1.json', content: '' }],
  };

  it('outputer samples test', async () => {
    const chunkNames = mockGeneration.chunks.map(it => it.name);

    const localOutput = await utilTest.localOutputer().output(mockGeneration);
    expect(localOutput.files).toEqual(chunkNames);

    const memoryOutput = await utilTest.memoryOutputer().output(mockGeneration);
    expect(memoryOutput.files).toEqual(chunkNames);
  });
});

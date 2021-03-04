import {
  getNormalizedOptions,
  mergeProcessors,
} from '../../src/options/normalize-options';

describe('options/normalizeOptions：规范化配置', () => {
  const testLoader = { type: 'loader', name: 'local', isTest: true };
  const testParser = { type: 'parser', name: 'yaml', isTest: true };
  const testParser2 = { type: 'parser', name: 'json', isTest: true };
  const testGenerator = { type: 'generator', name: 'json', isTest: true };
  const testOutputer = { type: 'outputer', name: 'memory', isTest: true };

  it('获取规范化选项 多次为不同对象，但值相同', () => {
    const options1 = getNormalizedOptions({});

    expect(options1.loaders.length).toBe(2);
    expect(options1.parsers.length).toBe(2);
    expect(options1.generators.length).toBe(2);
    expect(options1.outputers.length).toBe(2);

    const options2 = getNormalizedOptions({});
    expect(options1).not.toBe(options2);
    expect(options1.loaders).not.toBe(options2.loaders);
    expect(options1.loaders[0]).not.toBe(options2.loaders[0]);

    expect(JSON.stringify(options1)).toBe(JSON.stringify(options2));
  });

  it('获取规范化选项 默认值验证', () => {
    const options1 = getNormalizedOptions({
      defaultLoader: testLoader,
      loadOptions: { isTest: true },
      exProp: { isTestExProp: true },
    });

    expect(JSON.stringify(options1.defaultLoader)).toBe(
      JSON.stringify(testLoader),
    );

    expect(options1.loadOptions).toEqual({ isTest: true });
    expect(options1.exProp).toEqual({ isTestExProp: true });
  });

  it('合并处理器 mergeProcessors', () => {
    const options = {} as any;
    mergeProcessors('loader', options, { loaders: [testLoader] });
    expect(options.loaders[0]).toBe(testLoader);

    const options1 = getNormalizedOptions({});

    mergeProcessors('loader', options1, { loaders: [testLoader] });
    expect(options1.loaders[0]).toBe(testLoader);

    mergeProcessors('parser', options1, { parsers: [testParser, testParser2] });
    expect(options1.parsers[0]).toBe(testParser);
    expect(options1.parsers[1]).toBe(testParser2);

    mergeProcessors('generator', options1, { generators: [testGenerator] });
    expect(options1.generators[0]).toBe(testGenerator);

    mergeProcessors('outputer', options1, { outputers: [testOutputer] });
    expect(options1.outputers[0]).toBe(testOutputer);
  });
});

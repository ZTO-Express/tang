import { TangModuleTypes } from '@devs-tang/common/lib';
import {
  getNormalizedOptions,
  mergeProcessors,
  normalizePresetOptions,
  normalizeProcessor,
  getPresetConfigData,
} from '../../src';

describe('options/normalizeOptions：规范化配置', () => {
  const testLoader: any = {
    type: 'loader',
    name: 'local',
    isTest: true,
    loadOptions: { testStr: 'test' },
  };
  const testParser: any = {
    type: 'parser',
    name: 'yaml',
    pluginName: 'test',
    isTest: true,
  };
  const testParser2: any = { type: 'parser', name: 'json', isTest: true };
  const testGenerator: any = { type: 'generator', name: 'json', isTest: true };
  const testOutputer: any = { type: 'outputer', name: 'memory', isTest: true };

  it('获取规范化选项 多次为不同对象，但值相同', () => {
    const options1 = getNormalizedOptions(undefined);

    expect(options1.loaders.length).toBe(1);
    expect(options1.parsers.length).toBe(1);
    expect(options1.generators.length).toBe(1);
    expect(options1.outputers.length).toBe(1);

    const options2 = getNormalizedOptions({});
    expect(options1).not.toBe(options2);
    expect(options1.loaders).not.toBe(options2.loaders);
    expect(options1.loaders[0]).not.toBe(options2.loaders[0]);

    expect(JSON.stringify(options1)).toBe(JSON.stringify(options2));
  });

  it('获取规范化选项 默认值验证', () => {
    const options1 = getNormalizedOptions({
      defaultLoader: testLoader,
      loaders: [testLoader],
      parsers: [testParser, testParser2],
      loadOptions: { isTest: true },
      exProp: { isTestExProp: true },
    });

    expect(options1.loaders.length).toBe(2);
    expect(options1.loaders[0].pluginName).toBeUndefined();
    expect(options1.loaders[1].pluginName).toBe(undefined);
    expect(options1.loaders[1].moduleType).toBe(TangModuleTypes.core);
    expect(options1.parsers.length).toBe(2);

    expect(JSON.stringify(options1.defaultLoader)).toBe(
      JSON.stringify(testLoader),
    );

    expect(options1.loadOptions).toEqual({ isTest: true });
    expect(options1.exProp).toEqual({ isTestExProp: true });
  });

  it('获取规范化预设选项 normalizePresetOptions', () => {
    expect(normalizePresetOptions(undefined)).toBe(undefined);
    expect(normalizePresetOptions({})).toEqual({});
    expect(normalizePresetOptions({ name: 'test' })).toEqual({ name: 'test' });

    const options1 = normalizePresetOptions(
      {
        defaultLoader: testLoader,
        loaders: [testLoader],
        parsers: [testParser, testParser2],
      },
      {
        pluginName: 'test',
      },
    );

    const loader0 = options1.loaders[0];
    const parser0 = options1.parsers[0];

    expect((options1.defaultLoader as any).pluginName).toBe('test');

    expect(loader0.pluginName).toBe('test');
    expect(loader0.code).toBe(
      `plugin:${loader0.pluginName}:${loader0.type}:${loader0.name}`,
    );

    expect(parser0.pluginName).toBe('test');
    expect(parser0.code).toBe(
      `plugin:${parser0.pluginName}:${parser0.type}:${parser0.name}`,
    );

    expect(
      normalizePresetOptions(
        {
          name: 'test',
          pluginName: 'test1',
        },
        {
          pluginName: 'test2',
        },
      ),
    ).toEqual({
      name: 'test',
      pluginName: 'test1',
    });
  });

  it('获取规范化预设选项 normalizeProcessor', () => {
    expect(normalizeProcessor(undefined)).toBe(undefined);
    expect(() => normalizeProcessor({})).toThrow('必须提供名称和类型');
    expect(() => normalizeProcessor({ name: 'test' })).toThrow(
      '必须提供名称和类型',
    );
    expect(() => normalizeProcessor({ type: 'loader' })).toThrow(
      '必须提供名称和类型',
    );

    expect(() => normalizeProcessor({ name: 'test', type: 'loader' })).toThrow(
      '必须提供插件名称',
    );

    expect(
      normalizeProcessor({
        name: 'test',
        type: 'loader',
        pluginName: 'test',
      }),
    ).toEqual({
      code: 'plugin:test:loader:test',
      moduleType: 'plugin',
      name: 'test',
      pluginName: 'test',
      type: 'loader',
    });

    expect(
      normalizeProcessor(
        { type: 'loader', name: 'test', pluginName: 'test', code: 'xxx' },
        { pluginName: 'dev' },
      ),
    ).toEqual({
      type: 'loader',
      name: 'test',
      moduleType: 'plugin',
      pluginName: 'test',
      code: `xxx`,
    });
  });

  it('合并处理器 mergeProcessors', () => {
    const options = {} as any;
    mergeProcessors('loader' as any, options, { loaders: [testLoader] });
    expect(options.loaders[0]).toBe(testLoader);

    const options1 = getNormalizedOptions({});

    mergeProcessors('loader' as any, options1, { loaders: [testLoader] });
    expect(options1.loaders[0]).toBe(testLoader);

    mergeProcessors('parser' as any, options1, {
      parsers: [testParser, testParser2],
    });
    expect(options1.parsers[0]).toBe(testParser);
    expect(options1.parsers[1]).toBe(testParser2);

    mergeProcessors('generator' as any, options1, {
      generators: [testGenerator],
    });
    expect(options1.generators[0]).toBe(testGenerator);

    mergeProcessors('outputer' as any, options1, { outputers: [testOutputer] });
    expect(options1.outputers[0]).toBe(testOutputer);
  });

  it('合并处理器 mergeProcessors 2', () => {
    const results1 = mergeProcessors('loader' as any, undefined, {
      loaders: [testLoader],
    });
    expect(results1.loaders[0]).toBe(testLoader);

    const results2 = mergeProcessors(
      'loader' as any,
      {
        loaders: [testLoader] as any,
      },
      undefined,
    );

    expect(results2.loaders[0]).toBe(testLoader);
  });

  it('getPresetConfigData', () => {
    expect(getPresetConfigData(undefined)).toBe(undefined);

    expect(
      getPresetConfigData({
        name: 'test',
        moduleType: 'plugin',
        defaultLoader: undefined,
      }),
    ).toEqual({
      name: 'test',
    });

    expect(
      getPresetConfigData({
        name: 'test',
        moduleType: 'plugin',
        defaultLoader: 'test',
        loaders: [testLoader],
        parsers: [testParser],
      }),
    ).toMatchObject({
      name: 'test',
      defaultLoader: { name: 'test' },
      loaders: [
        {
          loadOptions: { testStr: 'test' },
          name: testLoader.name,
          type: testLoader.type,
        },
      ],
      parsers: [
        {
          code: `plugin:${testParser.pluginName}:${testParser.type}:${testParser.name}`,
          name: testParser.name,
          pluginName: testParser.pluginName,
          type: testParser.type,
        },
      ],
    });
  });
});

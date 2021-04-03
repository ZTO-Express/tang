import {
  TangModuleTypeKeys,
  TangProcessorTypeKeys,
  TangProcessorsTypeKeys,
} from '../../src';

describe('interfaces/ tang：类型验证', () => {
  it('验证指定常量是否符合预期', () => {
    expect(TangModuleTypeKeys).toEqual(['core', 'devkit', 'openapi', 'plugin']);

    expect(TangProcessorTypeKeys).toEqual([
      'loader',
      'parser',
      'generator',
      'outputer',
    ]);

    expect(TangProcessorsTypeKeys).toEqual([
      'loaders',
      'parsers',
      'generators',
      'outputers',
    ]);
  });
});

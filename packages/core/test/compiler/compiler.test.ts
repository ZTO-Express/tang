import * as testUtil from '../util';
import { DefaultTangCompiler } from '../../src';
import * as processors from '../../src/processors';

describe('compiler/load：load 加载', () => {
  const urlLoader = processors.urlLoader();
  const docLoader = testUtil.docLoader();

  const jsonParser = processors.jsonParser();
  const yamlParser = testUtil.yamlParser();

  const jsonGenerator = processors.jsonGenerator();
  const yamlGenerator = testUtil.yamlGenerator();

  const localOutputer = testUtil.localOutputer();
  const memoryOutputer = testUtil.memoryOutputer();

  const defaultOptions = {
    loaders: [urlLoader, docLoader],
    parsers: [jsonParser, yamlParser],
    generators: [jsonGenerator, yamlGenerator],
    outputers: [localOutputer, memoryOutputer],
  };

  it('验证 constructor', () => {
    const compiler1 = new DefaultTangCompiler({ ...defaultOptions });

    expect(compiler1.defaultLoader).toBe(urlLoader);
    expect(compiler1.defaultParser).toBe(jsonParser);
    expect(compiler1.loaders.length).toBe(2);
    expect(compiler1.loaders[0]).toBe(urlLoader);
    expect(compiler1.loaders[1]).toBe(docLoader);
    expect(compiler1.parsers.length).toBe(2);
    expect(compiler1.parsers[0]).toBe(jsonParser);
    expect(compiler1.parsers[1]).toBe(yamlParser);

    expect(
      new DefaultTangCompiler({ defaultLoader: 'doc', ...defaultOptions })
        .defaultLoader,
    ).toBe(docLoader);

    expect(
      new DefaultTangCompiler({ defaultLoader: docLoader, ...defaultOptions })
        .defaultLoader,
    ).toBe(docLoader);

    expect(
      new DefaultTangCompiler({ defaultParser: 'yaml', ...defaultOptions })
        .defaultParser,
    ).toBe(yamlParser);

    expect(
      new DefaultTangCompiler({ defaultParser: yamlParser, ...defaultOptions })
        .defaultParser,
    ).toBe(yamlParser);

    expect(
      new DefaultTangCompiler({ defaultGenerator: 'yaml', ...defaultOptions })
        .defaultGenerator,
    ).toBe(yamlGenerator);

    expect(
      new DefaultTangCompiler({
        defaultOutputer: memoryOutputer,
        ...defaultOptions,
      }).defaultOutputer,
    ).toBe(memoryOutputer);
  });

  it('没有返回值的加载器', async () => {
    const nonReturnLoader = {
      name: 'nonReturnLoader',
      load: (): any => undefined,
    } as any;

    const compile = new DefaultTangCompiler({
      loaders: [nonReturnLoader],
      compileOptions: {
        skipParse: true,
      },
    });

    const testDoc = 'testdoc';
    const compilation = await compile.load(testDoc);

    expect(compilation.document).toEqual({
      entry: testDoc,
    });
  });

  it('没有返回值的解析器', async () => {
    const nonReturnParser = {
      name: 'nonReturnParser',
      parse: (): any => undefined,
    } as any;

    const compile = new DefaultTangCompiler({
      parsers: [nonReturnParser],
      compileOptions: {
        skipLoad: true,
      },
    });

    const testDoc = 'testdoc';
    const compilation = await compile.load(testDoc);

    expect(compilation.document).toEqual({
      entry: testDoc,
    });
  });

  it('没有返回值的生成器', async () => {
    const nonReturnGenerator = {
      name: 'nonReturnGenerator',
      generate: (): any => undefined,
    } as any;

    const compile = new DefaultTangCompiler({
      generators: [nonReturnGenerator],
      compileOptions: {
        skipOutput: true,
      },
    });

    const testDoc = 'testdoc';
    const compilation = await compile.generate({ entry: testDoc });

    expect(compilation.document).toEqual({
      entry: testDoc,
    });
  });
});

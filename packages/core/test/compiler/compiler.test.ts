import * as testUtil from '../util';
import { Compiler } from '../../src';
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
    const compiler1 = new Compiler({ ...defaultOptions });

    expect(compiler1.defaultLoader).toBe(urlLoader);
    expect(compiler1.defaultParser).toBe(jsonParser);
    expect(compiler1.loaders.length).toBe(2);
    expect(compiler1.loaders[0]).toBe(urlLoader);
    expect(compiler1.loaders[1]).toBe(docLoader);
    expect(compiler1.parsers.length).toBe(2);
    expect(compiler1.parsers[0]).toBe(jsonParser);
    expect(compiler1.parsers[1]).toBe(yamlParser);

    expect(
      new Compiler({ defaultLoader: 'doc', ...defaultOptions }).defaultLoader,
    ).toBe(docLoader);

    expect(
      new Compiler({ defaultLoader: docLoader, ...defaultOptions })
        .defaultLoader,
    ).toBe(docLoader);

    expect(
      new Compiler({ defaultParser: 'yaml', ...defaultOptions }).defaultParser,
    ).toBe(yamlParser);

    expect(
      new Compiler({ defaultParser: yamlParser, ...defaultOptions })
        .defaultParser,
    ).toBe(yamlParser);

    expect(
      new Compiler({ defaultGenerator: 'yaml', ...defaultOptions })
        .defaultGenerator,
    ).toBe(yamlGenerator);

    expect(
      new Compiler({ defaultOutputer: memoryOutputer, ...defaultOptions })
        .defaultOutputer,
    ).toBe(memoryOutputer);
  });
});

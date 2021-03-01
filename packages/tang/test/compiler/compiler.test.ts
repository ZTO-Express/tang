import { Compiler } from '../../src/compiler';
import * as loader from '../../src/loader';
import * as parser from '../../src/parser';
import * as generator from '../../src/generator';
import * as outputer from '../../src/outputer';

describe('compiler/load：load 加载', () => {
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  const jsonGenerator = generator.jsonGenerator();
  const yamlGenerator = generator.yamlGenerator();

  const localOutputer = outputer.localOutputer();
  const memoryOutputer = outputer.memoryOutputer();

  const defaultOptions = {
    loaders: [urlLoader, localLoader],
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
    expect(compiler1.loaders[1]).toBe(localLoader);
    expect(compiler1.parsers.length).toBe(2);
    expect(compiler1.parsers[0]).toBe(jsonParser);
    expect(compiler1.parsers[1]).toBe(yamlParser);

    expect(
      new Compiler({ defaultLoader: 'local', ...defaultOptions }).defaultLoader,
    ).toBe(localLoader);

    expect(
      new Compiler({ defaultLoader: localLoader, ...defaultOptions })
        .defaultLoader,
    ).toBe(localLoader);

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

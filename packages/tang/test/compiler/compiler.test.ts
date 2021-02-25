import { Compiler } from '../../src/compiler';

import * as loader from '../../src/loader';
import * as parser from '../../src/parser';

describe('compiler/load：load 加载', () => {
  const urlLoader = loader.urlLoader();
  const localLoader = loader.localLoader();

  const jsonParser = parser.jsonParser();
  const yamlParser = parser.yamlParser();

  const defaultOptions = {
    loaders: [urlLoader, localLoader],
    parsers: [jsonParser, yamlParser],
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
      new Compiler({
        defaultLoader: 'local',
        ...defaultOptions,
      }).defaultLoader,
    ).toBe(localLoader);

    expect(
      new Compiler({
        defaultLoader: localLoader,
        ...defaultOptions,
      }).defaultLoader,
    ).toBe(localLoader);

    expect(
      new Compiler({
        defaultParser: 'yaml',
        ...defaultOptions,
      }).defaultParser,
    ).toBe(yamlParser);

    expect(
      new Compiler({
        defaultParser: yamlParser,
        ...defaultOptions,
      }).defaultParser,
    ).toBe(yamlParser);
  });
});

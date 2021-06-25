import * as testUtil from '../util';
import { TangDocument, TangCompilation } from '@devs-tang/common';
import { ProjectWorkspace } from '../../src/project';
import * as processors from '../../src/processors';

describe('generator/code：code生成器', () => {
  const origCwd = process.cwd; //保存初始cwd
  const fixtureRootDir = testUtil.resolveFixturePath('workspace');

  beforeEach(async () => {
    process.cwd = () => fixtureRootDir;
  });

  afterEach(async () => {
    process.cwd = origCwd;
  });

  it('normalizeCodegenOptions', async () => {
    let config = processors.normalizeCodegenOptions({
      rootDir: './',
      codegenConfig: {
        baseDir: './a',
        templatesDir: './b',
      },
    } as any);
    expect(config.codegenDir).toBe(testUtil.fs.joinPath(process.cwd(), './a'));
    expect(config.templatesDir).toBe(
      testUtil.fs.joinPath(process.cwd(), './a', './b'),
    );

    config = processors.normalizeCodegenOptions({
      rootDir: '/root',
      codegenConfig: {
        baseDir: '/my/base',
        templatesDir: '/my/templates',
      },
    } as any);
    expect(config.rootDir).toBe('/root');
    expect(config.codegenDir).toBe('/my/base');
    expect(config.templatesDir).toBe('/my/templates');
  });

  it('getCodegenTemplates', async () => {
    let templates = await processors.getCodegenTemplates(
      {
        templates: ['a1', 'a2'],
        getTemplates: () => ['b1', 'b2'],
      },
      {
        retrieveCodegenTemplates: () => ['c1', 'c2'],
      } as any,
    );
    expect(templates).toEqual(['a1', 'a2']);

    templates = await processors.getCodegenTemplates(
      {
        getTemplates: () => ['b1', 'b2'],
      },
      {
        retrieveCodegenTemplates: () => ['c1', 'c2'],
      } as any,
    );
    expect(templates).toEqual(['b1', 'b2']);

    templates = await processors.getCodegenTemplates({}, {
      retrieveCodegenTemplates: () => ['c1', 'c2'],
    } as any);
    expect(templates).toEqual(['c1', 'c2']);
  });

  it('简单生成页面', async () => {
    const codeGenerator = processors.codeGenerator();

    await expect(() =>
      codeGenerator.generate(
        {
          entry: '.',
        },
        {},
      ),
    ).rejects.toThrow('未找到任何代码模版');

    await expect(() =>
      codeGenerator.generate(
        {
          entry: '.',
        },
        { templates: [] },
      ),
    ).rejects.toThrow('未找到任何代码模版');

    let document = await codeGenerator.generate(
      {
        entry: '.',
      },
      {
        templates: [
          undefined,
          {},
          { content: '' },
          { relativePath: './a', content: 'atext' },
        ],
      },
    );

    expect(document.chunks.length).toBe(3);
    expect(document.chunks[0].name).toBeUndefined();
    expect(document.chunks[0].content).toBeUndefined();
    expect(document.chunks[1].name).toBe(undefined);
    expect(document.chunks[1].content).toBe('');
    expect(document.chunks[2].name).toBe('./a');
    expect(document.chunks[2].content).toBe('atext');

    document = await codeGenerator.generate(
      {
        entry: '.',
      },
      {
        templates: [
          undefined,
          {},
          { content: '' },
          { relativePath: './a', content: 'atext' },
        ],
        render: (tmpl: any) => {
          if (!tmpl.relativePath) return undefined;
          return tmpl;
        },
      },
    );

    expect(document.chunks.length).toBe(1);
  });

  it('workspace生成页面', async () => {
    const codeGenerator = processors.codeGenerator();
    const document: TangDocument = {
      entry: '.',
    };

    const compilation: TangCompilation = {
      entry: '.',
      document,
    };

    const workspace = await ProjectWorkspace.createInstance();
    expect(workspace.rootDir).toBe(fixtureRootDir);
    expect(typeof workspace.codegenConfig.render).toBe('function');

    document.model = Object.assign(
      {
        formData: {},
        formConfig: {},
        tableConfig: {},
        pageDir: '',
        pageName: '',
        api: {
          query: '',
        },
      },
      document.model,
    );

    await codeGenerator.generate(document, {}, compilation, {
      isWorkspace: true,
      workspace,
    });

    expect(Array.isArray(document.chunks));
    expect(document.chunks.length).toBeGreaterThan(0);
    expect(typeof document.chunks[0].name).toBe('string');
    expect(typeof document.chunks[0].content).toBe('string');
  });
});

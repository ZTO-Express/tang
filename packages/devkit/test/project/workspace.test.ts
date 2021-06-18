import * as testUtil from '../util';
import { ProjectWorkspace } from '../../src/project';

describe('tang/project/workspace：项目工作区', () => {
  //保存初始cwd
  const origCwd = process.cwd;
  const fixtureRootDir = testUtil.resolveFixturePath('workspace');
  const fixtureWsConfigPath2 = testUtil.resolveFixturePath(
    'workspace/tang2.config.js',
  );

  beforeEach(async () => {
    process.cwd = () => fixtureRootDir;
  });

  afterEach(async () => {
    process.cwd = origCwd;
  });

  it('初始化工作区工作区', async () => {
    const ws = await ProjectWorkspace.createInstance();

    expect(ws.exists()).toBe(true);
    expect(ws.rootDir).toBe(fixtureRootDir);
    expect(ws.codegenConfig).toMatchObject({
      baseDir: './codegen',
      templatesDir: './templates',
    });
    expect(ws.codegenDir).toEqual(
      testUtil.fs.joinPath(fixtureRootDir, './codegen'),
    );
  });

  it('获取工作区配置', async () => {
    const ws = await ProjectWorkspace.createInstance(fixtureWsConfigPath2, {
      myTest: 'devkit',
      options: {
        newTest: true,
      },
    });

    expect(ws.get('')).toBeUndefined();

    const config = ws.get('.');

    expect(config.myTest).toBe('devkit');
    expect(config.isWorkspace).toBe(true);
    expect(typeof config.options).toEqual('object');
    expect(Array.isArray(config.presets)).toBe(true);
    expect(config.options.newTest).toBe(true);

    expect(ws.get<boolean>('isWorkspace')).toBe(true);
    expect(ws.get<boolean>('options.codegen.baseDir')).toBe('./codegen');
    expect(ws.getOption<boolean>('codegen.baseDir')).toBe('./codegen');

    config.options.codegen.baseDir = '/a/b/c';
    expect(ws.codegenDir).toBe('/a/b/c');

    expect(config.rootDir).toBe(fixtureRootDir);
    config.rootDir = '';
    expect(ws.exists()).toBe(false);
    config.rootDir = 'nonExists';
    expect(ws.exists()).toBe(false);

    const options = ws.getOption('.');
    expect(options.newTest).toBe(true);

    const ws2 = await ProjectWorkspace.createInstance();
    const config2 = ws2.get('.');
    expect(config).not.toEqual(config2);
  });

  it('代码生成相关', async () => {
    const ws = await ProjectWorkspace.createInstance();
    const templates = ws.retrieveCodegenTemplates();

    expect(Array.isArray(templates)).toBe(true);
    expect(templates[0]).toHaveProperty('content');
    expect(templates[0]).toHaveProperty('fullPath');
    expect(templates[0]).toHaveProperty('relativePath');

    expect(() => ws.retrieveCodegenTemplates('xxxx')).toThrow();

    const templates2 = ws.retrieveCodegenTemplates(
      testUtil.resolveFixturePath('workspace/codegen/templates'),
    );

    expect(templates).toEqual(templates2);
  });
});

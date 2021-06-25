import {
  GenericConfigObject,
  TangChunk,
  TangCompilation,
  TangCompilerContext,
  TangDocument,
  TangDocumentModel,
  TangGenerator,
} from '@devs-tang/common';

import * as path from 'path';

import { ProjectWorkspace } from '../../src';

import { fs, utils } from '../utils';
import {
  CODE_GEN_DEFAULT_DIR,
  CODE_GEN_DEFAULT_TEMPLATES_DIR,
} from '../consts';

import { TangLauncher } from '../launch';
import { normalizeDevkitProcessor } from './util';

/** 项目代码生成模版 */
export interface CodegenTemplate {
  fullPath: string;
  relativePath: string;
  content: string;
}

export type CodegenRender = (
  template: CodegenTemplate,
  model: TangDocumentModel,
  document: TangDocument,
  options: GenericConfigObject,
  compilation: TangCompilation,
  context: TangCompilerContext,
) => TangChunk | Promise<TangChunk>;

/**
 * 代码生成器
 */
export const codeGenerator = (): TangGenerator => {
  return normalizeDevkitProcessor({
    type: 'generator',

    name: 'codegen',

    async generate(
      document: TangDocument,
      options: GenericConfigObject,
      compilation: TangCompilation,
      context: TangCompilerContext,
    ) {
      const launcher = context as TangLauncher;
      const workspace = launcher?.workspace;

      const normalizedOptions: any = normalizeCodegenOptions(
        workspace,
        options,
      );

      const codegenRender = normalizedOptions.render as CodegenRender;

      const templates = await getCodegenTemplates(normalizedOptions, workspace);
      if (!templates?.length) {
        throw new Error('未找到任何代码模版。');
      }

      const chunks: TangChunk[] = [];

      for (const tmpl of templates) {
        if (!tmpl) continue;

        const chunk = await Promise.resolve().then(() => {
          return codegenRender(
            tmpl,
            document.model,
            document,
            options,
            compilation,
            context,
          );
        });

        if (chunk) {
          chunks.push(chunk);
        }
      }

      document.chunks = chunks;

      return document;
    },
  });
};

// 规范化代码生成配置
export function normalizeCodegenOptions(
  workspace?: ProjectWorkspace,
  options?: GenericConfigObject,
) {
  const codegenOptions = workspace?.codegenConfig;
  const rootDir = fs.absolutePath(workspace?.rootDir, process.cwd());

  const codegenConfig = utils.deepMerge(
    {},
    codegenOptions,
    options,
  ) as GenericConfigObject;

  // 获取代码生成目录
  let codegenDir = utils.get(codegenConfig, 'baseDir', CODE_GEN_DEFAULT_DIR);
  codegenDir = fs.absolutePath(codegenDir, rootDir);

  // 获取代码生成模版目录
  let templatesDir = utils.get(
    codegenConfig,
    'templatesDir',
    CODE_GEN_DEFAULT_TEMPLATES_DIR,
  );
  templatesDir = fs.absolutePath(templatesDir, codegenDir);

  let render = codegenConfig.render;
  if (!render) {
    // 默认代码渲染函数
    render = (tmpl: CodegenTemplate) => {
      return {
        name: tmpl.relativePath,
        content: tmpl.content,
      };
    };
  }

  return {
    ...codegenConfig,
    rootDir,
    codegenDir,
    templatesDir,
    render,
  };
}

// 获取代码生成模版
export async function getCodegenTemplates(
  normalizedOptions: GenericConfigObject,
  workspace?: ProjectWorkspace,
) {
  // 获取模版信息
  let templates = normalizedOptions.templates;

  if (templates) return templates;

  if (normalizedOptions.getTemplates) {
    templates = await Promise.resolve().then(() => {
      return normalizedOptions.getTemplates();
    });
  } else if (workspace?.retrieveCodegenTemplates) {
    templates = await Promise.resolve().then(() =>
      workspace.retrieveCodegenTemplates(normalizedOptions.templatesDir),
    );
  }

  return templates;
}

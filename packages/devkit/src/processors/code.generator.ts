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
import { utils } from '../utils';
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

      const codegenOptions = workspace?.codegenConfig;
      const rootDir = launcher?.workspace.rootDir || process.cwd();

      const codegenConfig = utils.deepMerge(
        {},
        codegenOptions,
        options,
      ) as GenericConfigObject;

      // 获取代码生成目录
      let codegenDir = utils.get(
        codegenConfig,
        'baseDir',
        CODE_GEN_DEFAULT_DIR,
      );

      if (!path.isAbsolute(codegenDir)) {
        codegenDir = path.join(rootDir, codegenDir);
      }

      // 获取代码生成模版目录
      let templatesDir = utils.get(
        codegenConfig,
        'templatesDir',
        CODE_GEN_DEFAULT_TEMPLATES_DIR,
      );

      if (!path.isAbsolute(templatesDir)) {
        templatesDir = path.join(codegenDir, templatesDir);
      }

      // 获取模版信息
      const templates = workspace.retrieveCodegenTemplates(templatesDir);

      const chunks: TangChunk[] = [];

      const codegenRender = codegenConfig.render as CodegenRender;
      if (!codegenRender) {
        throw new Error('未找到代码渲染器。');
      }

      for (const tmpl of templates) {
        if (!tmpl || !tmpl.fullPath || !tmpl.content) continue;

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

        chunks.push(chunk);
      }

      document.chunks = chunks;

      return document;
    },
  });
};

import {
  GenericConfigObject,
  TangOutput,
  TangOutputer,
  Chunk,
  InvalidArguments,
  TangDocument,
} from '@devs-tang/common';

import * as path from 'path';

import { fs } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * 本地文件输出器
 */
export const localOutputer = (): TangOutputer => {
  return normalizeDevkitProcessor({
    type: 'outputer',

    name: 'local',

    async output(
      document: TangDocument,
      options: GenericConfigObject,
    ): Promise<TangOutput> {
      options = options || {};

      if (!options.outputDir) {
        options.outputDir = process.cwd();
      }

      const outputDir = options.outputDir;
      const overwrite = (options.overwrite = options.overwrite !== false); // 是否覆盖已存在目录(默认true)

      await fs.ensureDir(outputDir); // 确认目录存在

      const files: any[] = [];

      const ops = document.chunks.map(async (chunk: Chunk) => {
        if (!chunk.content) return;

        const filePath = path.join(outputDir, chunk.name);

        if (!overwrite) {
          const existsFile = await fs.pathExists(filePath);
          if (existsFile) return;
        }

        await fs.ensureDir(path.dirname(filePath));

        await fs.writeFile(filePath, chunk.content);

        files.push({
          path: filePath,
          chunk,
          options,
        });
      });

      await Promise.all(ops);

      return {
        result: true,
        files,
      };
    },
  });
};

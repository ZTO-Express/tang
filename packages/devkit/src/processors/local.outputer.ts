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
      if (!options || !options.outputDir)
        throw new InvalidArguments('请提供输出目录');

      const outputDir = options.outputDir;
      const clearDir = options.clearDir === true; // 是否晴空目录(默认false)
      const overwrite = options.overwrite !== false; // 是否覆盖已存在目录(默认true)

      if (clearDir) {
        await fs.emptyDir(outputDir);
      }

      await fs.ensureDir(outputDir); // 确认目录存在

      const files: any[] = [];

      const ops = document.chunks.map(async (chunk: Chunk) => {
        if (!chunk.content) return;

        const filePath = path.join(outputDir, chunk.name);

        if (!overwrite) {
          const existsFile = await fs.pathExists(filePath);
          if (existsFile) return;
        }

        await fs.writeFile(filePath, chunk.content);

        files.push({
          path: filePath,
          chunk,
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

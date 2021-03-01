import path from 'path';
import { error } from '../common';
import {
  GenericConfigObject,
  TangDocumentGeneration,
  TangDocumentOutput,
  TangDocumentOutputer,
} from '../common/types';

import { fs } from '../utils';

/**
 * 本地文件输出器
 */
export const localOutputer = (): TangDocumentOutputer => {
  return {
    type: 'outputer',

    name: 'local',

    async output(
      generation: TangDocumentGeneration,
      options?: GenericConfigObject,
    ): Promise<TangDocumentOutput> {
      if (!options || !options.outputDir) {
        error.throwError(error.errInvalidArguments('请提供输出目录'));
      }

      const outputDir = options.outputDir as string;
      const clearDir = options.clearDir === true; // 是否晴空目录(默认false)
      const overwrite = options.overwrite !== false; // 是否覆盖已存在目录(默认true)

      if (clearDir) {
        await fs.emptyDir(outputDir);
      }

      await fs.ensureDir(outputDir); // 确认目录存在

      const files: any[] = [];

      const ops = generation.chunks.map(async chunk => {
        if (!chunk.content) return;

        const filePath = path.join(outputDir, chunk.name);

        if (!overwrite) {
          const existsFile = await fs.pathExists(filePath);
          if (!existsFile) return;
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
  };
};

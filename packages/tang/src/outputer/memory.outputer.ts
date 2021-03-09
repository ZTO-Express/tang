import { TangGeneration, TangOutput, TangOutputer } from '../@types';

import * as path from 'path';
import { memfs } from '../utils';

const Volume = memfs.Volume;

/**
 * 内存文件输出器，一般用于测试或watch的场景
 */
export const memoryOutputer = (): TangOutputer => {
  return {
    type: 'outputer',

    name: 'memory',

    async output(generation: TangGeneration): Promise<TangOutput> {
      const vol = Volume.fromJSON({});
      const fs = vol.promises;

      const files: any[] = [];

      const ops = generation.chunks.map(async chunk => {
        if (!chunk.content) return;

        const filePath = chunk.name;

        const dirPath = path.dirname(filePath);

        await fs.mkdir(dirPath, { recursive: true });
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
        vol,
      };
    },
  };
};

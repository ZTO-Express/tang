import { TangDocument, TangOutput, TangOutputer } from '@devs-tang/common';

import * as path from 'path';
import { memfs } from '../utils';
import { normalizeDevkitProcessor } from './util';

const Volume = memfs.Volume;

/**
 * 内存文件输出器，一般用于测试或watch的场景
 */
export const memoryOutputer = (): TangOutputer => {
  return normalizeDevkitProcessor({
    type: 'outputer',

    name: 'memory',

    async output(document: TangDocument): Promise<TangOutput> {
      const vol = Volume.fromJSON({});
      const fs = vol.promises;

      const files: any[] = [];

      const ops = document.chunks.map(async chunk => {
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
  });
};

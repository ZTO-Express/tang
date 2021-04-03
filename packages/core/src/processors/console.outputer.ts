import {
  Chunk,
  TangGeneration,
  TangOutput,
  TangOutputer,
} from '@devs-tang/common';
import { normalizeCoreProcessor } from './util';

/**
 * 内存文件输出器，一般用于测试或watch的场景
 */
export const consoleOutputer = (): TangOutputer => {
  return normalizeCoreProcessor({
    type: 'outputer',

    name: 'console',

    async output(generation: TangGeneration): Promise<TangOutput> {
      const files: any[] = [];

      (generation.chunks || []).forEach(async (chunk: Chunk) => {
        console.log(`${chunk.name} :`);
        console.log(chunk.content || '');
        console.log('');

        files.push({
          path: chunk.name,
          chunk,
        });
      });

      return {
        result: true,
        files,
      };
    },
  });
};

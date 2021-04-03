import {
  GenericConfigObject,
  Chunk,
  TangDocument,
  TangGenerateResult,
  TangGenerator,
} from '@devs-tang/common';

import { yaml } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * yaml文件生成器
 */
export const yamlGenerator = (): TangGenerator => {
  return normalizeDevkitProcessor({
    type: 'generator',

    name: 'yaml',

    async generate(
      document: TangDocument,
      options: GenericConfigObject,
    ): Promise<TangGenerateResult> {
      const opts = Object.assign(
        { name: 'default.yaml', skipInvalid: true },
        options,
      );

      const content = yaml.dump(document.model, options);
      const name = opts.name as string;

      const chunks: Chunk[] = [{ name, content }];

      return {
        chunks,
      };
    },
  });
};

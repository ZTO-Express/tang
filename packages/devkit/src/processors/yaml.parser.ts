import {
  GenericConfigObject,
  DocumentModel,
  TangParser,
} from '@devs-tang/common';

import { yaml } from '../utils';
import { normalizeDevkitProcessor } from './util';

/**
 * Yaml解析器
 */
export const yamlParser = (): TangParser => {
  return normalizeDevkitProcessor({
    type: 'parser',

    name: 'yaml',

    async parse(
      content: string,
      options?: GenericConfigObject,
    ): Promise<DocumentModel> {
      const result = yaml.load(content, options);
      return result as DocumentModel;
    },
  });
};

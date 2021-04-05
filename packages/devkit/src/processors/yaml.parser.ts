import {
  GenericConfigObject,
  TangDocument,
  TangDocumentModel,
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

    async parse(document: TangDocument, options?: GenericConfigObject) {
      document.model = yaml.load(
        document.content,
        options,
      ) as TangDocumentModel;

      return document;
    },
  });
};

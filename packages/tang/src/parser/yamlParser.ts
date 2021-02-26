import { yaml } from '../utils';
import {
  TangDocumentModel,
  GenericConfigObject,
  TangDocumentParser,
} from '../common/types';

/**
 * Yaml解析器
 */
export const yamlParser = (): TangDocumentParser => {
  return {
    type: 'parser',

    name: 'yaml',

    async parse(
      content: string,
      options?: GenericConfigObject,
    ): Promise<TangDocumentModel> {
      const result = yaml.load(content, options);
      return result as TangDocumentModel;
    },
  };
};

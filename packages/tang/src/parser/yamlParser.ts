import { yaml } from '../utils';
import { TangDocumentModel, GenericConfigObject } from '../tang/types';

/**
 * Yaml解析器
 */
export const yamlParser = () => {
  return {
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

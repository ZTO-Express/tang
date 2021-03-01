import { yaml } from '../utils';
import { TangModel, GenericConfigObject, TangParser } from '../common/types';

/**
 * Yaml解析器
 */
export const yamlParser = (): TangParser => {
  return {
    type: 'parser',

    name: 'yaml',

    async parse(
      content: string,
      options?: GenericConfigObject,
    ): Promise<TangModel> {
      const result = yaml.load(content, options);
      return result as TangModel;
    },
  };
};

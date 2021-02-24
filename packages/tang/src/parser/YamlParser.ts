import { yaml } from '../utils';
import { DocumentModel, GenericConfigObject } from '../tang/types';

/**
 * Yaml解析器
 */
export const yamlParser = {
  name: 'yaml',

  async parse(
    content: string,
    options?: GenericConfigObject,
  ): Promise<DocumentModel> {
    const result = yaml.load(content, options);
    return result as DocumentModel;
  },
};

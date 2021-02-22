import { Document, DocumentParser, GenericConfigObject } from '../tang/types';

/**
 * Yaml解析器
 */
export const YamlParser: DocumentParser = {
  name: 'yaml',

  async parse(
    content: string | Buffer,
    options?: GenericConfigObject,
  ): Promise<Document> {
    return {};
  },
};

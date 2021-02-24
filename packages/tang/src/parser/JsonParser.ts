import { Document, DocumentParser, GenericConfigObject } from '../tang/types';

/**
 * Json解析器
 */
export const JsonParser: DocumentParser = {
  name: 'json',

  async parse(
    content: string | Buffer,
    options?: GenericConfigObject,
  ): Promise<Document> {
    return {};
  },
};

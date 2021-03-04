import { yaml } from '../utils';

/**
 * yaml文件生成器
 */
export const yamlGenerator = (): TangGenerator => {
  return {
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

      const chunks: TangChunk[] = [{ name, content }];

      return {
        chunks,
      };
    },
  };
};

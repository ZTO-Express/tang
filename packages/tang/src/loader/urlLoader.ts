import { isUrl, fetch } from '../utils';
import { GenericConfigObject, TangLoader } from '../common/types';

/**
 * 通过url加载文件
 */
export const urlLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'url',

    test: (entry: string) => isUrl(entry),

    async load(entry: string, options?: GenericConfigObject): Promise<string> {
      const res = await fetch.request(entry, options);
      const text = await res.text();
      if (!res.ok) {
        let errorMsg = res.statusText;

        if (text.length <= 100) {
          errorMsg = text;
        }

        throw new Error(text || res.statusText);
      }

      return text;
    },
  };
};

import { TangLoader, utils } from '@devs-tang/common';

/**
 * 通过加载js模块
 */
export const moduleLoader = (): TangLoader => {
  return {
    type: 'loader',

    name: 'module',

    test: (entry: string) => utils.isPath(entry),

    async load(entry: string): Promise<any> {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const result = require(entry);
      return result;
    },
  };
};

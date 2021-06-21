import {
  GenericConfigObject,
  TangCompilation,
  TangDocument,
  TangCompilerContext,
  TangPluginLoader,
  errors,
} from '@devs-tang/common';

import { YApiService } from '../service';

/**
 * yapi typescript调用接口生成器
 */
export const yapiLoader = (): TangPluginLoader => {
  return {
    name: 'yapi',

    async load(
      document: TangDocument,
      options: GenericConfigObject,
      compilation: TangCompilation,
      context: TangCompilerContext,
    ): Promise<TangDocument> {
      const ws = context.workspace;

      options = options || {};

      const loadOptions: any =
        (compilation && compilation.loadProcessOptions) || {};

      let url = options.url || loadOptions.url;

      if (!url) {
        url = ws?.getOption('yapi.url');
      }

      if (!url) {
        throw new errors.ExecuteFailedError(
          '获取yapi服务地址错误，在代码生成页面配置 yapi.url',
        );
      }

      let tokens = options.tokens || loadOptions.tokens;
      if (!tokens) {
        tokens = ws?.getOption('yapi.tokens');
      }

      if (!tokens) {
        throw new errors.ExecuteFailedError(
          '获取yapi tokens错误，在代码生成页面配置 yapi.tokens',
        );
      }

      const sourceParts: string[] = Array.isArray(tokens)
        ? tokens
        : tokens.split(',');

      // 将指定token的url加载 到特定文件夹
      const fetchOps = sourceParts.map(it => {
        return new YApiService({ url, token: it }).fetchExportData();
      });

      const exportDatas = await Promise.all(fetchOps);
      document.content = exportDatas;

      return document;
    },
  };
};

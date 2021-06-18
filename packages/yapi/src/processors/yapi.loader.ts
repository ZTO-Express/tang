import {
  GenericConfigObject,
  TangCompilation,
  TangDocument,
  TangPluginLoader,
  errors,
  fs,
  utils,
} from '@devs-tang/devkit';

import { CODE_GEN_SOURCE_DIR, YAPI_URL } from '../consts';
import { YApiService, ProjectWorkspace } from '../codegen';

/**
 * yapi typescript调用接口生成器
 */
export const yapiLoader = (config: any = {}): TangPluginLoader => {
  return {
    name: 'zf-yapi',

    async load(
      document: TangDocument,
      options: GenericConfigObject,
      compilation: TangCompilation,
    ): Promise<TangDocument> {
      options = options || {};

      // 简化当前目录写法
      if (document.entry === '.') {
        document.entry = './';
      }

      const loadOptions: any =
        (compilation && compilation.loadProcessOptions) || {};

      let url = options.url || loadOptions.url || config.url;

      const ws = await ProjectWorkspace.createInstance();

      if (!url) {
        url = ws.get('yapi.url') || YAPI_URL;
      }

      const source: string = ws.get('yapi.source');

      if (!source) {
        throw new errors.ExecuteFailedError(
          '获取yapi源错误，在代码生成页面配置 yapi.source。',
        );
      }

      const sourceParts = source.split(',');

      // 将指定token的url加载 到特定文件夹
      const fetchOps = sourceParts.map(it => {
        if (utils.isPath(it) || it.endsWith('.json')) {
          let sourceFile = it;
          if (!utils.isAbsolutePath(it)) {
            sourceFile = fs.joinPath(ws.codegenDir, CODE_GEN_SOURCE_DIR, it);
          }
          return fs.resolveFile(sourceFile, 'json');
        } else {
          return new YApiService({ url, token: it }).fetchExportData();
        }
      });

      const exportDatas = await Promise.all(fetchOps);

      document.content = exportDatas.reduce((all, cur) => {
        return all.concat(cur);
      }, []);

      return document;
    },
  };
};

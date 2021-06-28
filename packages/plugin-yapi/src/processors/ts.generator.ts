import {
  GenericConfigObject,
  TangCompilation,
  TangDocument,
  TangCompilerContext,
  TangPluginGenerator,
  utils,
} from '@devs-tang/common';

import * as path from 'path';
import { compile } from 'json-schema-to-typescript';

/** 定义源 */
const DEFINITION_SOURCE = {
  REQUEST: 0,
  RESPONSE: 1,
};

type apiRenderParams = {
  method: string; // get/post, etc.
  url: string; // api url
  methodName: string; // 方法名字(根据 methodNameMode methodName会不同)
  parameters: string; // 入参类型
  responseType: string; // 出参类型
};

export interface YapiTsGeneratorConfig {
  source: any[]; //  yapi接口源码
  outputDir: string; // 输出路径
  fileName: string; // 输出文件名
  renderHeader: () => string; // 渲染头部 类似注释信息，导入信息 可写在这里
  apiRender: (params: apiRenderParams) => string; // 渲染api方法  注释会自动加上 不需要再回调带出
  apiWrapper: (apiSource: string) => string; // 所有api包裹代码   回调带出 被 apiRender渲染出来得代码
  format: (apiSource: string) => string; // 最终格式化，可用 eslint对代码格式化
}

/**
 * yapi typescript调用接口生成器
 */
export const tsGenerator = (
  config?: YapiTsGeneratorConfig,
): TangPluginGenerator => {
  return {
    name: 'ts',

    async generate(
      document: TangDocument,
      options: GenericConfigObject,
      compilation: TangCompilation,
      context: TangCompilerContext,
    ): Promise<TangDocument> {
      options = Object.assign(
        {
          source: [],
          outputDir: './ouptput',
          fileName: 'webapi.ts',
          renderHeader: () => '',
          apiRender: ({}) => '',
          apiWrapper: (code: string) => code,
          format: (code: string) => code,
        },
        config,
        options,
      );

      // yapi默认无需进行解析
      const yapiSource =
        options.source && options.source.length
          ? options.source
          : document.model;

      let apiSource = options.renderHeader() || '';

      const { definitions, requestCode } = await requestCodeGen(
        yapiSource,
        options,
      );

      apiSource += requestCode;

      for (const val of Object.values(definitions)) {
        apiSource += val;
      }

      if (typeof options.format === 'function') {
        apiSource = options.format(apiSource);
      }

      document.chunks = [
        {
          name: path.join(options.outputDir, options.fileName),
          content: apiSource,
        },
      ];

      return document;
    },
  };
};

/** 请求参数代码生成 */
async function requestCodeGen(yapiSource: any[], options: any) {
  const definitions: any = {};
  const requestCode = [];

  for (const group of yapiSource) {
    for (const apiConfig of group.list) {
      let reqDefName = '';
      let resDefName = '';

      //请求 schema
      if (apiConfig.req_body_is_json_schema && apiConfig.req_body_other) {
        const reqBodyOther = JSON.parse(apiConfig.req_body_other);

        const defName = getDefinitionName(
          apiConfig.path,
          DEFINITION_SOURCE.REQUEST,
        );

        reqDefName = defName;

        reqBodyOther.title = defName;

        definitions[defName] = await compile(reqBodyOther, defName, {
          bannerComment: `
                    /** ${apiConfig.title}入参  */`,
        });
      }

      //响应  schema
      if (apiConfig.res_body_is_json_schema && apiConfig.res_body) {
        const resBody = JSON.parse(apiConfig.res_body);

        const defName = getDefinitionName(
          apiConfig.path,
          DEFINITION_SOURCE.RESPONSE,
        );

        resDefName = defName;

        resBody.title = defName;
        if (
          resBody.properties.result &&
          resBody.properties.result.title === 'empty object'
        )
          resBody.properties.result.title = undefined;

        definitions[defName] = await compile(resBody, defName, {
          bannerComment: `
                    /** ${apiConfig.title}出参  */`,
        });
      }

      requestCode.push(`
            /**  ${apiConfig.title} */
            ${options.apiRender({
              method: apiConfig.method.toLowerCase(),
              url: apiConfig.path,
              methodName: getMethodName(apiConfig.path),
              bodyParams: reqDefName,
              queryParams: handleQueryParams(apiConfig.req_query).join(','),
              responseType: resDefName,
            })}
            `);
    }
  }

  return {
    definitions,
    requestCode: `
    ${options.apiWrapper(requestCode.join(' '))}
    `,
  };
}

/** 处理查询请求 */
function handleQueryParams(reqQueryOptions: any) {
  const queryParams = [];

  for (const reqQueryOption of reqQueryOptions) {
    //todo: yapi 上 query 参数没有类型
    queryParams.push(`  
            /** ${reqQueryOption.desc} */
            ${reqQueryOption.name}${
      reqQueryOption.required === '1' ? '?' : ''
    } : unknown
        `);
  }

  return queryParams;
}

/** 获取方法名 */
function getMethodName(path: string) {
  const paths = path.split('/');

  const result: any[] = [];

  paths.forEach(path => {
    if (!/\{.+\}/.test(path) && path) {
      result.push(path);
    }
  });
  return result.join('_');
}

/** 获取定义名称 */
function getDefinitionName(path: string, source: number) {
  let methodName = getMethodName(path);

  methodName = utils.strings.capitalize(utils.strings.camelize(methodName));

  return (
    methodName + (source === DEFINITION_SOURCE.REQUEST ? 'Request' : 'Response')
  );
}

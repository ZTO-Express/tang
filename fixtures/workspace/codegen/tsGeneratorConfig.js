const prettier = require('prettier');

module.exports = {
  //输出目录
  outputDir: './src/api',
  //输出文件名
  fileName: 'webapi.ts',
  // 渲染头部 类似注释信息，导入信息 可写在这里
  renderHeader: () => {
    return `
        /* eslint-disable */
        import Http from '@/utils/http'
            `;
  },
  // 渲染api方法  注释会自动加上 不需要再
  // 会回调带出
  // method :get / post,
  // url,  api url
  // methodName 方法名字(根据 methodNameMode methodName会不同)
  // parameters 入参类型
  // responseType 出参类型
  apiRender: ({
    method,
    url,
    methodName,
    bodyParams,
    queryParams,
    responseType,
  }) => {
    const parameters =
      method === 'get'
        ? `params:{${queryParams}}`
        : ` params:${bodyParams || '{}'} `;

    return ` async ${methodName} ( ${parameters}) {
            const result =  await super.${method}("${url}",arguments[0]) as ${
      responseType == 'any' ? responseType : responseType + '["result"]'
    }
                return result
            } `;
  },

  // 所有api包裹代码   回调带出 被 apiRender渲染出来得代码
  apiWrapper: apiSource => {
    return `export default new class Api extends Http {
        ${apiSource}
    }`;
  },

  // 最终格式化，可用 eslint对代码格式化
  format: apiSource => {
    // return apiSource
    return prettier.format(apiSource, {
      printWidth: 120,
      tabWidth: 2,
      parser: 'typescript',
      trailingComma: 'none',
      jsxBracketSameLine: false,
      semi: false,
      singleQuote: true,
    });
  },
};

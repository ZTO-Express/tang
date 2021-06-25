const fs = require('fs-extra');
const path = require('path');

/**
 * Json解析器
 */
module.exports.pageParser = () => {
  return {
    name: 'page',

    async parse(document, options, compilation, context) {
      const ws = context.workspace;
      const projectDir = ws.rootDir;

      const content = document.content;
      const entry = document.entry;

      const pageConfig = await readPageConfig(entry);
      pageConfig.api = pageConfig.api || {};

      const model = parsePageModel({
        ...pageConfig,
        source: content,
      });

      const pageRelativeDir =
        pageConfig.pageDir && fs.relativePath(projectDir, pageConfig.pageDir);

      document.model = {
        projectDir,
        pageRelativeDir,
        ...pageConfig,
        ...model,
        source: content,
      };

      return document;
    },
  };
};

// 读取页面配置
async function readPageConfig(dir) {
  const cwd = process.cwd();
  dir = dir || cwd;

  let configDir = dir;

  if (path.isAbsolute(dir)) {
    configDir = dir;
  } else {
    configDir = path.join(cwd, dir);
  }

  const existsDir = await fs.pathExists(configDir);
  if (!existsDir) return undefined;

  const stat = await fs.stat(configDir);

  let configPath = configDir;
  if (stat.isDirectory()) {
    configPath = path.join(configDir, 'page.json');
  }

  const existsPath = await fs.pathExists(configPath);
  if (!existsPath) return undefined;

  const configData = await fs.readJSON(configPath);

  const pageDir = path.dirname(configPath);
  const pageName = path.basename(pageDir);

  return { pageDir, pageName, ...configData };
}

// 根据配置解析page model
function parsePageModel(config) {
  let source = config.source;

  let apiConfig = findApiConfig(source, config.api.query || '');
  if (!apiConfig) return undefined;

  let tableConfig = parserTableConfig(apiConfig);

  let { formData, formConfig } = parserForm(apiConfig);

  return { tableConfig, formData, formConfig };
}

/**
 * 通过 api path 找到 api配置信息
 */
function findApiConfig(source, path) {
  for (let yapiGroup of source || []) {
    for (let apiConfig of yapiGroup.list || []) {
      if (apiConfig.path !== path) continue;

      return apiConfig;
    }
  }
}

/**
 * 解析出 table 配置
 */
function parserTableConfig(apiConfig, options) {
  options = options || {};
  const listPropertyPath = options.listPropertyPath || 'result.list';

  let tableConfig = [];

  if (!apiConfig.res_body_is_json_schema || !apiConfig.res_body)
    return undefined;

  let resBody = JSON.parse(apiConfig.res_body);
  let properties = getYapiProperties(
    listPropertyPath,
    resBody.properties || {},
  );

  for (let [propName, prop] of Object.entries(properties || [])) {
    tableConfig.push({
      prop: propName,
      label: prop.description || '',
    });
  }

  return tableConfig;
}

/**
 * 解析出 formData 与 form 配置
 */
function parserForm(apiConfig) {
  const formData = {};
  const formConfig = [];

  let reqBodyOther = JSON.parse(apiConfig.req_body_other);
  for (let [prop, property] of Object.entries(reqBodyOther.properties || {})) {
    formData[prop] = '';
    formConfig.push({
      prop,
      label: property.description,
      itemType: 'input',
    });
  }

  return { formData, formConfig };
}

/**
 * 通过字段配置解析出 properties 对象
 * @param rowDataField string
 * @param properties Record<string, IProperty>
 */
function getYapiProperties(rowDataField, properties) {
  let fields = rowDataField.split('.');

  if (!properties) return {};

  for (let field of fields) {
    if (!properties[field]) continue;

    if (properties[field].type === 'object') {
      properties = properties[field].properties || {};
    } else if (properties[field].type === 'array' && properties[field].items) {
      properties = properties[field].items.properties || {};
    }
  }

  return properties;
}

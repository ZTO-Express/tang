<!-- <CWidgetSchemaViewer name="WCrud" type="desc" /> -->

增删改查微件目前基本上是中后台管理使用最频繁的微件，对应 ui-element 下面 WCrud 组件。其主要作用是对列表类型的数据进行查询、展示、操作等功能。该微件同时也包含部分页面自动布局功能，一般情况必须外部需要套一个容器，通常和 Page 页面配合使用。

## 基本用法

最基本的用法是配置 数据源接口(api) 以及 展示列(columns)

```json
// --- doc-sample:zpage-widget ---
{
  "type": "crud",
  "style": { "height": "500px" },
  "actions": {
    "query": {
      "api": "/fixtures/data/list/crud",
      "mockData": {
        "data": [
          {
            "code": "10001",
            "name": "XX门店",
            "amount": 1000,
            "remark": "当天入库量",
            "addedStatus": 1,
            "status": 0,
            "customerStatus": 1
          },
          { "code": "CODE2", "name": "名称2", "amount": 20, "remark": "描述xxx" },
          { "code": "CODE3", "name": "名称3", "amount": 20, "remark": "描述xxx", "status": 1 },
          { "code": "CODE4", "name": "名称4", "amount": 20, "remark": "描述xxx", "status": 0, "customerStatus": 1 },
          { "code": "CODE5", "name": "名称5", "amount": 20, "remark": "描述xxx", "status": 1, "customerStatus": 1 }
        ],
        "sum": {
          "amount": 19000
        }
      }
    },
    "add": {
      "api": {
        "url": "addApi"
      },
      "dialog": {
        "width": 800,
        "labelWidth": 80,
        "formItems": [
          {
            "label": "门店编号",
            "type": "input",
            "required": true
          },
          {
            "label": "规则类型",
            "type": "fuzzy-select",
            "prop": "storeRuleType",
            "api": "api.getRuleTypeList",
            "filterable": false,
            "required": true,
            "placeholder": "请选择"
          },
          {
            "label": "规则节点",
            "type": "fuzzy-select",
            "prop": "storeRuleTypeNode",
            "api": "api.getRuleTypeNodeList",
            "optionValueProp": "storeRuleTypeNode",
            "optionLabelProp": "storeRuleTypeNodeName",
            "dynamicAttrs": {
              "apiParams": {
                "storeRuleType": "${data.storeRuleType}"
              }
            },
            "filterable": false,
            "required": true,
            "placeholder": "请选择"
          },
          {
            "label": "规则参数",
            "type": "fuzzy-select",
            "prop": "storeLifeCustomerId",
            "api": "api.listCustomerParamValue",
            "optionValueProp": "id",
            "optionLabelProp": "paramValue",
            "isOptionLabelPropTooltip": true,
            "dynamicAttrs": {
              "apiParams": {
                "storeRuleType": "${data.storeRuleType}",
                "storeRuleTypeNode": "${data.storeRuleTypeNode}"
              }
            },
            "filterable": false,
            "required": true,
            "placeholder": "请选择"
          },
          {
            "label": "备注",
            "type": "textarea",
            "prop": "remark",
            "rows": 2,
            "maxlength": 200,
            "required": true,
            "span": 24
          }
        ]
      }
    },
    "delete": {
      "api": "deleteApi",
      "payload": {
        "ids": ["${data.row.id}"]
      },
      "message": "是否确定删除？"
    }
  },
  "search": {
    "items": [
      { "type": "input", "prop": "code", "label": "编号" },
      { "type": "input", "prop": "name", "label": "名称" }
    ]
  },
  "toolbar": {
    "items": [{ "action": "add" }]
  },
  "table": {
    "showSummary": true,

    "operation": {
      "width": 100,
      "items": [
        {
          "action": "delete",
          "visibleOn": "this.data.row.addedStatus === 1"
        },
        {
          "action": "enable",
          "visibleOn": "this.data.row.status === 0 && this.data.row.customerStatus ===1"
        },
        {
          "action": "disable",
          "visibleOn": "this.data.row.status === 1 && this.data.row.customerStatus === 1"
        }
      ]
    },
    "columns": [
      { "prop": "code", "label": "编号", "width": 160 },
      { "prop": "name", "label": "名称", "width": 200 },
      { "prop": "amount", "label": "金额", "summaryProp": true, "summaryFormatter": "yuanMoney", "width": 100 },
      { "prop": "remark", "label": "备注" }
    ]
  }
}
```

## 查询接口数据结构

详细请参考：<a href="http://w.ztosys.com/129571592" target="_blank">接口文档规范</a>

### 请求数据结构

- pageIndex: 分页参数，查询当前页标识，从 1 开始
- pageSize: 分页参数，分页大小

```json
{
  "pageIndex": 1, // 当前页
  "pageSize": 15, // 单页条数
  "...": "..." // 其他查询条件
}
```

### 返回数据结构

- result.data: 用于返回查询数据，格式为数组
- result.total: 用于返回查询一共有多少条数据，用于生成分页
- result.sum: 用于返回指定的汇总数据，sum 中字端对应 column 配置中的字端

```json
{
  "result": {
    "data": [
      // 返回数据
      { "code": "CODE1", "name": "名称1", "amount": 10, "remark": "描述..." }, // 每一行数据
      { "code": "CODE2", "name": "名称2", "amount": 20, "remark": "描述xxx" }
    ],
    "pageSize": 15, // 单页条数
    "total": 100, // 这里返回的是查询数据的总条数，用于生成分页组件，如果你不想要分页，把这个可以不返回
    "sum": {
      // 汇总数据
      "amount": 30 // 指定字段的汇总信息
    }
  },
  "message": "操作成功", // 消息（出错后提示）
  "status": true, // 请求状态，true: 成功，false: 失败
  "statusCode": "SYS000" // 错误码
}
```

<!-- ## 操作

<CWidgetSchemaViewer name="WCrud" type="tree" /> -->

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "actions",
      "desc": "数据结构为map，对象的key未活动项名称，值为活动项配置信息。详细活动项配置可参考基础微件WAction。",
      "type": "map",
      "enum": "",
      "default": "",
      "children": [
        {
          "name": "query",
          "desc": "加载表单数据请求api。",
          "type": "object",
          "children": [
            {
              "name": "api",
              "desc": "",
              "type": "string|object",
              "children": [
                {
                  "name": "url",
                  "desc": "api请求路径。可以写成ns:path, ns为命名空间用于识别特定api",
                  "type": "string"
                },
                {
                  "name": "mockData",
                  "desc": "mock api接口返回数据，一般只在dev环境生效",
                  "type": "any"
                },
                {
                  "name": "requestTransform",
                  "desc": "此方法对请求数据进行转换",
                  "type": "function"
                },
                {
                  "name": "responseTransform",
                  "desc": "此方法对返回数据进行转换",
                  "type": "function"
                }
              ]
            },
            {
              "name": "perm",
              "desc": "权限字段用于确认按钮是否显示。若为true，则取api路径作为action按钮权限。若为数组，则拥有任一权限的用户将可以看到此行为按钮。",
              "type": "bollean|string|array"
            },
            {
              "name": "payload",
              "desc": "负载。若为对象则，为经过模版计算的api参数，若为方法，则为返回api对象的参数，若返回false，则会阻断请求。用户可在此方法中进行二次弹窗获取用户数据，或条件判断，阻断请求等操作。",
              "type": "object|function|array"
            },
            {
              "name": "successMessage",
              "desc": "执行成功消息。若为false,则执行成功后不进行任何提示。",
              "type": "boolean|string",
              "default": "执行成功"
            }
          ]
        },
        {
          "name": "messageAction",
          "nameText": "message",
          "desc": "消息活动项 (这里列出常用选项，更多详情参考WAction弹框Schema)。",
          "type": "object",
          "children": [
            {
              "name": "messageContent",
              "nameText": "message",
              "desc": "消息配置。若为字符串，则为弹出字符串内容。",
              "type": "string|object",
              "default": "",
              "children": [
                {
                  "name": "boxType",
                  "desc": "弹出框类型",
                  "type": "string",
                  "enum": "success|info|warning|error",
                  "default": ""
                },
                {
                  "name": "type",
                  "desc": "消息类型",
                  "type": "string",
                  "enum": "confirm|alert|prompt",
                  "default": "warning"
                },
                {
                  "name": "messageText",
                  "nameText": "message",
                  "desc": "消息内容",
                  "type": "string",
                  "default": ""
                },
                {
                  "name": "showCancelButton",
                  "desc": "是否显示取消按钮",
                  "type": "boolean",
                  "default": "true"
                },
                {
                  "name": "...",
                  "desc": "其余属性可参考element-plus MessageBox组件属性",
                  "type": "",
                  "default": ""
                }
              ]
            },
            {
              "name": "...",
              "desc": "其他属性参考query action属性"
            }
          ]
        },
        {
          "name": "dialogAction",
          "nameText": "dialog",
          "desc": "弹框活动项 (这里列出常用选项，更多详情参考WAction弹框Schema)。",
          "type": "object",
          "default": "",
          "children": [
            {
              "name": "dialogContent",
              "nameText": "dialog",
              "desc": "弹窗配置，参考WAction弹窗配置。若为function，则为执行function返回的配置。",
              "type": "function|object",
              "children": [
                {
                  "name": "dialogTitle",
                  "nameText": "title",
                  "desc": "弹窗标题，为通过模版计算后的标题",
                  "type": "string"
                },
                {
                  "name": "dialogWidth",
                  "nameText": "width",
                  "desc": "弹框宽度",
                  "type": "number|width"
                },
                {
                  "name": "dialogFormItemSpan",
                  "nameText": "itemSpan",
                  "desc": "表单项默认span",
                  "type": "number",
                  "default": 12
                },
                {
                  "name": "dialogFormItems",
                  "nameText": "formItems",
                  "desc": "表单项列表，详细可参考WForm表单项配置",
                  "type": "array"
                },
                {
                  "name": "dialogInnerAttrs",
                  "nameText": "innerAttrs",
                  "desc": "弹框内部属性",
                  "type": "object",
                  "children": [
                    {
                      "name": "dialogInnerAttrsDialog",
                      "nameText": "dialog",
                      "desc": "弹框内部关于弹框的属性",
                      "type": "object"
                    },
                    {
                      "name": "dialogInnerAttrsForm",
                      "nameText": "form",
                      "desc": "弹框内部关于表单的属性",
                      "type": "object"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "export",
          "desc": "一般作为导出全部",
          "type": "object",
          "children": [
            {
              "name": "exportType",
              "desc": "导出类型",
              "type": "object",
              "default": "",
              "required": true
            }
          ]
        },
        {
          "name": "...",
          "desc": "其他活动项，下面列出一般action常用选项。",
          "type": "object",
          "default": ""
        }
      ]
    },
    {
      "name": "search",
      "desc": "查询选项。如果为false，则不显示查询框部分",
      "type": "boolean｜object",
      "children": [
        {
          "name": "searchImmediate",
          "nameText": "immediate",
          "desc": "是否立即查询，如为false，则页面加载时不执行查询，只有指定事件触发后才执行查询",
          "type": "boolean"
        },
        {
          "name": "searchFormItems",
          "nameText": "items",
          "desc": "查询表单选项，参考WForm表单项配置",
          "type": "array"
        },
        {
          "name": "searchHidden",
          "nameText": "hidden",
          "desc": "为false则隐藏查询项",
          "type": "boolean"
        }
      ]
    },
    {
      "name": "toolbar",
      "desc": "默认显示的tab的标签值。若未设置或未找到指定的默认项，将默认显示第一个tab页。",
      "type": "object",
      "children": [
        {
          "name": "toolbarActionItems",
          "nameText": "items",
          "desc": "toolbar行为按钮选项，参考WAction行为按钮配置",
          "type": "array"
        }
      ]
    },
    {
      "name": "table",
      "desc": "列表相关配置",
      "type": "object",

      "children": [
        {
          "name": "noOperation",
          "desc": "隐藏配置项",
          "type": "boolean"
        },
        {
          "name": "noIndex",
          "desc": "隐藏序号项",
          "type": "boolean"
        },
        {
          "name": "tableeEitable",
          "name": "editable",
          "desc": "表格是否支持编辑",
          "type": "boolean"
        },
        {
          "name": "operation",
          "desc": "操作列配置",
          "type": "array",
          "children": [
            {
              "name": "operationAction",
              "nameText": "action",
              "desc": "操作action，对应crud action配置",
              "type": "string"
            },
            {
              "name": "operationVisibleOn",
              "nameText": "visibleOn",
              "desc": "可通过表达式计算当前操作按钮是否显示",
              "type": "string"
            },
            {
              "name": "operationHidden",
              "nameText": "hidden",
              "desc": "是否隐藏操作列",
              "type": "boolean"
            },
            {
              "name": "operationWidth",
              "nameText": "width",
              "desc": "操作列宽度",
              "type": "number"
            },
            {
              "name": "operationActionItems",
              "nameText": "items",
              "desc": "operation行为按钮选项，参考WAction行为按钮配置",
              "type": "array"
            }
          ]
        },
        {
          "name": "columns",
          "desc": "表格列配置",
          "type": "array",
          "children": [
            {
              "name": "columnsLabel",
              "nameText": "label",
              "desc": "表格列配置",
              "type": "array"
            },
            {
              "name": "columnsProp",
              "nameText": "prop",
              "desc": "表格列属性",
              "type": "string"
            },
            {
              "name": "columnsTpl",
              "nameText": "tpl",
              "desc": "表格列模版。详细参考WTpl组件。",
              "type": "string"
            },
            {
              "name": "columnsWidth",
              "nameText": "width",
              "desc": "表格列宽度",
              "type": "number|string"
            },
            {
              "name": "columnsMinWidth",
              "nameText": "minWidth",
              "desc": "表格列最小宽度",
              "type": "number|string"
            },
            {
              "name": "columnsFormatter",
              "nameText": "formatter",
              "desc": "表格列格式化。支持模版格式化字符串，或方法进行格式化。",
              "type": "number|function"
            },
            {
              "name": "columnsFixed",
              "nameText": "fixed",
              "desc": "是否支持固定栏",
              "type": "boolean"
            },
            {
              "name": "columnsAlign",
              "nameText": "align",
              "desc": "表格列对齐",
              "type": "string",
              "enum": "center|left|right",
              "default": "center"
            },
            {
              "name": "columnsTooltip",
              "nameText": "tooltip",
              "desc": "表格列是否支持tooltip",
              "type": "boolean",
              "default": "true"
            },
            {
              "name": "columnsCell",
              "nameText": "cell",
              "desc": "单元格属性，这里可以设置单元格样式等信息",
              "type": "object"
            },
            {
              "name": "columnsHeader",
              "nameText": "header",
              "desc": "header属性，表格头部信息",
              "type": "object"
            },
            {
              "name": "columnsEditor",
              "nameText": "editor",
              "desc": "表格编辑属性，支持自定义组件",
              "type": "object",
              "children": [
                {
                  "type": "columnsEditorPopover",
                  "nameText": "popover",
                  "desc": "是否弹框编辑",
                  "type": "boolean"
                },
                {
                  "type": "columnsEditorCmpt",
                  "nameText": "cmpt",
                  "desc": "自定义编辑组件",
                  "type": "string"
                },
                {
                  "name": "columnsEditorConfig",
                  "nameText": "...",
                  "desc": "自定义编辑组件其他相关配置",
                  "type": "any"
                }
              ]
            },
            {
              "name": "columnsCmpt",
              "nameText": "cmpt",
              "desc": "支持内容为自定义组件",
              "type": "object",
              "children": [
                {
                  "type": "columnsComponentType",
                  "nameText": "type",
                  "desc": "自定义组件配置",
                  "type": "object"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

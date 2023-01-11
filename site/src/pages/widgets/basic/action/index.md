一般会包含其他微件中使用，对应 ui-element 下面 WAction 组件。其本质是对 [CAction 组件](/#/cmpts/func/action)的包装。

## 基本用法

### 字符串写法

```json
// --- doc-sample:zpage-widget ---
{
  "type": "action",
  "api": "api.testApi",
  "apiParams": {
    "p1": "x",
    "p2": "${route.name}",
    "v1": "${data.var1}"
  },
  "extData": {
    "ex1": "ex1"
  },
  "payload": {},
  "contextData": {
    "var1": "xxxx"
  },
  "message": "是否执行",
  "label": "执行"
}
```

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "label",
      "desc": "按钮标签。可以是模版字符串，可参考模版微件。若不填写，默认使用name作为label。",
      "type": "string",
      "enum": "",
      "default": ""
    },
    {
      "name": "actionType",
      "desc": "行为类型。此属性用于确认行为按钮默认执行操作，如上传、导入等。如未设置，行为按钮会根据属性的特点自行判断行为类型，比如，如果属性中包含 dialog配置，则默认此行为未弹框行为。",
      "type": "form｜dialog|download|link|event|message",
      "enum": "",
      "default": "message"
    },
    {
      "name": "buttonType",
      "desc": "按钮类型，可参考element-plus按钮类型。",
      "type": "primary|text|success|info|warning|danger",
      "enum": "",
      "default": "primary,如actionType为link，则默认text"
    },
    {
      "name": "textEllipsis",
      "desc": "为true时，单元格内的按钮文案如果超出宽度则省略号",
      "type": "boolean",
      "enum": "",
      "default": "false"
    },
    {
      "name": "api",
      "desc": "api为请求行为，其具体执行根据其他属性配置执行不同含义，比如如果时弹框类型，则执行为提交逻辑，如果为message，则为执行api请求逻辑，详细可以参考api请求配置",
      "type": "string|object",
      "children": [
        {
          "name": "url",
          "desc": "api路径",
          "type": "string"
        },
        {
          "name": "mockData",
          "desc": "mock数据",
          "type": "any"
        },
        {
          "name": "...",
          "desc": "其他属性参考api请求属性",
          "type": "",
          "enum": ""
        }
      ]
    },
    {
      "name": "apiParams",
      "desc": "api参数。如果为对象则为经过模版计算的api",
      "type": "object",
      "enum": "",
      "default": ""
    },
    {
      "name": "payload",
      "desc": "负载。",
      "type": "object|function|array",
      "enum": "",
      "default": ""
    },
    {
      "name": "extData",
      "desc": "api扩展数据。执行api时将作为附加数据覆盖计算后的参数。",
      "type": "object"
    },
    {
      "name": "perm",
      "desc": "权限字段用于确认按钮是否显示。若为true，则取api路径作为按钮。若为数组，则拥有任一权限的用户将可以看到此行为按钮。",
      "type": "bollean|string|array"
    },
    {
      "name": "contextData",
      "desc": "上下文数据。",
      "type": "object"
    },
    {
      "name": "successMessage",
      "desc": "执行成功消息。若为false,则执行成功后不进行任何提示。",
      "type": "boolean|string",
      "default": "执行成功"
    },
    {
      "name": "message",
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
          "name": "type",
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
      "name": "dialog",
      "desc": "弹框配置。详情参考弹框组件。",
      "type": "object",
      "default": "",
      "children": [
        {
          "name": "title",
          "desc": "弹框标题",
          "type": "string",
          "enum": "",
          "default": "默认与行为按钮标签保持一致"
        },
        {
          "name": "bodyHeight",
          "desc": "弹出框body高度",
          "type": "number|string"
        },
        {
          "name": "...",
          "desc": "其余属性可参考dialog组件属性",
          "type": "",
          "default": ""
        }
      ]
    },
    {
      "name": "import",
      "desc": "导入配置。详情参考导入配置。",
      "type": "object",
      "default": ""
    },
    {
      "name": "upload",
      "desc": "上传配置。",
      "type": "object",
      "default": ""
    },
    {
      "name": "link",
      "desc": "跳转配置。",
      "type": "object",
      "default": ""
    },
    {
      "name": "event",
      "desc": "事件配置。",
      "type": "object",
      "default": ""
    },
    {
      "name": "triggerOn",
      "desc": "触发事件",
      "type": "array[string]",
      "enum": "",
      "default": ""
    },
    {
      "name": "visible",
      "desc": "是否显示",
      "type": "boolean",
      "enum": "",
      "default": "true"
    },
    {
      "name": "disabled",
      "desc": "是否失效",
      "type": "boolean",
      "enum": "",
      "default": "false"
    },
    {
      "name": "visibleOn",
      "desc": "根据当前上下文计算是否显示",
      "type": "string|function"
    },
    {
      "name": "disabledOn",
      "desc": "根据当前上下文计算是否失效",
      "type": "string|function"
    },
    {
      "name": "cmpt",
      "desc": "Action支持自定义组件模式，可直接渲染为指定的组件。",
      "type": "object"
    },
    {
      "name": "innerAttrs",
      "desc": "内部配置。",
      "type": "object",
      "default": "",
      "children": [
        {
          "name": "button",
          "desc": "按钮内部配置",
          "type": "object",
          "enum": "",
          "default": ""
        },
        {
          "name": "dialog",
          "desc": "弹框内部配置",
          "type": "object",
          "enum": "",
          "default": ""
        }
      ]
    }
  ]
}
```

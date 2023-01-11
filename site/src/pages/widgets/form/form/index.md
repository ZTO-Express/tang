目前 ZPage 提供 WForm 表单微件，但通常情况下 form 会作为其他微件的内置微件使用，入 Crud 查询表单，弹出框表单等等。Form 的表单项有以 CFormItem 开头的组件组成。表单项的微件也即

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": {
    "fetch": {
      "api": {
        "url": "api.fetchData",
        "mockData": { "enable": 1, "remark": "备注信息" }
      }
    },
    "save": { "api": "api.saveData" },
    "submit": { "api": "api.submitData" }
  },
  "formActions": [
    { "action": "submit", "disabledOn": "!this.data.id", "label": "保存" },
    { "action": "submit" },
    { "action": "reload" }
  ],
  "formItems": [
    { "label": "是否启用", "type": "switch", "prop": "enable", "activeValue": 1, "inactiveValue": 0 },
    { "label": "版本号", "type": "input", "prop": "version", "required": true, "placeholder": "请填写版本号" },
    {
      "label": "备注",
      "type": "textarea",
      "prop": "remark",

      "span": 24,
      "maxlength": 2000,
      "autoHeight": true
    }
  ],
  "fetchOn": ["$global_page_tab_change"],
  "resetOn": ["$page_mounted"]
}
```

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "actions",
      "desc": "活动项。可参考增删改查页面活动项。数据结构为map，对象的key未活动项名称，值为活动项配置信息。详细活动项配置可参考基础微件WAction。",
      "type": "map",
      "enum": "",
      "default": "",
      "children": [
        {
          "name": "fetch",
          "desc": "表单数据初始化action，表单加载后会将此活动项的返回值作为表单初始值。详细配置可参考api类型action。",
          "type": "object",
          "default": ""
        },
        {
          "name": "submit",
          "desc": "一般作为表单提交活动",
          "type": "object",
          "default": "",
          "required": true
        },
        {
          "name": "...",
          "desc": "其他活动项",
          "type": "object",
          "default": ""
        }
      ]
    },
    {
      "name": "formActions",
      "desc": "表单活动项，显示在表单下面，详细参考action。",
      "type": "array",
      "default": "",
      "children": [
        {
          "name": "submit",
          "desc": "提交表单属性，会在提交时进行表单验证，提交后刷新表单。",
          "type": "object",
          "default": "",
          "required": true
        },
        {
          "name": "reload",
          "desc": "重新加载表单数据",
          "type": "object",
          "default": "",
          "required": true
        },
        {
          "name": "...",
          "desc": "其他活动项",
          "type": "object",
          "default": ""
        }
      ]
    },
    {
      "name": "formItems",
      "desc": "表单项配置。详细参考各表单项Schema配置。",
      "type": "array",
      "default": ""
    },
    {
      "name": "fetchOn",
      "desc": "监听事件，事件触发后将触发重新加载页面数据",
      "type": "array",
      "default": ""
    },
    {
      "name": "resetOn",
      "desc": "重设事件，事件触发后将触发表单数据还原",
      "type": "array",
      "default": ""
    }
  ]
}
```

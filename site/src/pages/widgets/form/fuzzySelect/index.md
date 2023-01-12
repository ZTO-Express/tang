可进行关键字模糊搜索，远程查询，也可以对第一次搜索结果进行缓存进行本地筛选，算是 select 的加强版。对应组件 CFormItemFuzzySelect。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "fuzzy-select",
      "api": "api.fuzzySelect",
      "apiParams": { "id": 123 },
      "prop": "select",
      "label": "模糊查询",
      "optionValueProp": "code",
      "optionLabelProp": "label",
      "triggerFocus": true,
      "remote": false
    },
    {
      "type": "fuzzy-select",
      "prop": "belongUnionId",
      "label": "可缓存筛选",
      "api": "api.getUser",
      "apiParams": { "cdcCd": "${app.currentCdc.cdcCd}", "platform": "pc", "pageIndex": 1, "pageSize": 1000 },
      "optionValueProp": "unionId",
      "optionLabelProp": "nickName",
      "tpl": "${nickName} (${phone})",
      "filterable": true,
      "triggerFocus": true,
      "remote": true,
      "width": 100
    }
  ]
}
```

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "model",
      "desc": "form表单的model",
      "type": "object",
      "default": "",
      "required": true
    },
    {
      "name": "prop",
      "desc": "formItem中对应的model中的key",
      "type": "string",
      "default": "",
      "required": true
    },
    {
      "name": "disabled",
      "desc": "是否禁用",
      "type": "boolean",
      "default": "false",
      "required": false
    },
    {
      "name": "labelProp",
      "desc": "有时候后端不仅需要select的value，还需要label字段，该配置用于设置向后端传输的label字段名",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "optionProp",
      "desc": "用于设置optionData的别名",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "optionLabelProp",
      "desc": "option选项中 label 的自定义别名",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "optionValueProp",
      "desc": "option选项中 value 的自定义别名",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "optionGroupProp",
      "desc": "用于设置option分组名称",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "multiple",
      "desc": "是否多选",
      "type": "boolean",
      "default": "false",
      "required": false
    },
    {
      "name": "collapseTags",
      "desc": "多选时，选中项是否折叠",
      "type": "boolean",
      "default": "true",
      "required": false
    },
    {
      "name": "showTips",
      "desc": "多选折叠时，启用鼠标悬停折叠文字以显示具体所选值的行为",
      "type": "boolean",
      "default": "",
      "required": false
    }
  ]
}
```

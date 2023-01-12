当选项过多时，使用下拉菜单展示并选择内容。对应组件 CFormItemSelect。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "label": "基础用法",
      "type": "select",
      "prop": "select1",
      "options": [
        { "value": "Option1", "label": "Option1" },
        { "value": "Option2", "label": "Option2" },
        { "value": "Option3", "label": "Option3" },
        { "value": "Option4", "label": "Option4" }
      ]
    },
    {
      "label": "有禁用项",
      "type": "select",
      "prop": "select2",
      "options": [
        { "value": "Option1", "label": "Option1" },
        { "value": "Option2", "label": "Option2" },
        { "value": "Option3", "label": "Option3", "disabled": true },
        { "value": "Option4", "label": "Option4" }
      ]
    },
    {
      "label": "分组",
      "type": "select",
      "prop": "select3",
      "groupName": "group",
      "options": [
        { "value": "Option1", "label": "Option1", "group": "分组1" },
        { "value": "Option2", "label": "Option2", "group": "分组1" },
        { "value": "Option3", "label": "Option3", "group": "分组2" },
        { "value": "Option4", "label": "Option4", "group": "分组2" }
      ]
    },
    {
      "label": "多选可折叠",
      "type": "select",
      "prop": "select4",
      "multiple": true,
      "collapseTags": true,
      "options": [
        { "value": "Option1", "label": "Option1" },
        { "value": "Option2", "label": "Option2" },
        { "value": "Option3", "label": "Option3" },
        { "value": "Option4", "label": "Option4" }
      ]
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
      "name": "options",
      "desc": "下拉选项",
      "type": "array / function / string",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "group",
          "desc": "option选项对应的分组名，与 groupName 结合使用",
          "type": "string",
          "default": "",
          "required": false
        }
      ]
    },
    {
      "name": "groupName",
      "desc": "option分组名，与option选项中的 group 结合使用",
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
      "name": "filterable",
      "desc": "Select 组件是否可筛选",
      "type": "boolean",
      "default": "false",
      "required": false
    }
  ]
}
```

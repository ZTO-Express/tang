最常用的单/多选框控件。对应组件 CFormItemCheckbox。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "checkbox",
      "checkType": "radio",
      "label": "单选框",
      "prop": "radioValue",
      "options": [
        {
          "label": "Option A",
          "value": "A"
        },
        {
          "label": "Option B",
          "value": "B"
        },
        {
          "label": "Option C",
          "value": "C"
        },
        {
          "label": "Option D",
          "value": "D"
        }
      ],
      "required": false,
      "autoHeight": true,
      "span": 24
    },
    {
      "type": "checkbox",
      "checkType": "checkbox",
      "label": "多选框",
      "prop": "checkboxValue",
      "options": [
        {
          "label": "Option A",
          "value": "A"
        },
        {
          "label": "Option B",
          "value": "B"
        },
        {
          "label": "Option C",
          "value": "C"
        },
        {
          "label": "Option D",
          "value": "D"
        }
      ],
      "required": true,
      "autoHeight": true,
      "span": 24
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
      "name": "type",
      "desc": "组件类型",
      "type": "string",
      "enum": "checkbox",
      "default": "",
      "required": false,
    },
    {
      "name": "checkType",
      "desc": "选框类型",
      "type": "string",
      "enum": "radio/checkbox",
      "default": "checkbox",
      "required": false,
    },
    {
      "name": "label",
      "desc": "标签",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "prop",
      "desc": "属性名",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "options",
      "desc": "选项",
      "type": "array",
      "enum": "",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "label",
          "desc": "选项的标签，若不设置则默认与value相同",
          "type": "string",
          "default": ""
        },
        {
          "name": "value",
          "desc": "选项的值",
          "type": "string",
          "default": ""
        },
        {
          "name": "disabled",
          "desc": "是否禁用该选项",
          "type": "	boolean",
          "default": "false"
        }
      ]
    }
  ]
}
```

最常用的表单编辑表格控件。对应组件 CFormItemEditTable。

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
        "mockData": {
          "editTable": [
            {
              "name": "名称1",
              "code": "code1"
            },
            {
              "name": "名称2",
              "code": "code2"
            }
          ]
        }
      }
    },
    "submit": { "api": "api.submitData" }
  },
  "formItems": [
    {
      "label": "编辑表格",
      "type": "edit-table",
      "prop": "editTable",
      "span": 24,
      "height": 300,
      "autoHeight": true,
      "columns": [
        {
          "label": "名称",
          "prop": "name",
          "minWidth": 160,
          "editor": {
            "itemType": "input",
            "label": "名称",
            "required": true
          }
        },
        {
          "label": "编号",
          "prop": "code",
          "minWidth": 180,
          "editor": {
            "itemType": "select",
            "label": "编号",
            "options": [
              {
                "label": "编号1",
                "value": "code1"
              },
              {
                "label": "编号2",
                "value": "code2"
              }
            ],
            "required": true
          }
        }
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
      "name": "type",
      "desc": "组件类型",
      "type": "string",
      "enum": "image",
      "default": "",
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
      "name": "columns",
      "desc": "列设置",
      "type": "array",
      "enum": "",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "label",
          "desc": "列标签",
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
          "name": "width",
          "desc": "列宽度",
          "type": "number",
          "enum": "",
          "default": "",
          "required": false,
        },
        {
          "name": "minWidth",
          "desc": "列最小宽度",
          "type": "number",
          "enum": "",
          "default": "",
          "required": false,
        },
        {
          "name": "editor",
          "desc": "编辑对象",
          "type": "object",
          "enum": "",
          "default": "",
          "required": false,
          "children": [
            {
              "name": "itemType",
              "desc": "组件类型",
              "type": "string",
              "enum": "input/select/...",
              "default": "",
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
              "name": "required",
              "desc": "必填项",
              "type": "boolean",
              "enum": "true/false",
              "default": "false",
              "required": false,
            },
          ],
        },
      ]
    }
  ]
}
```

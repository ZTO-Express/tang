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
          "editTable": {
            "data": []
          },
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
      "columns": [
        {
            "label": "名称",
            "prop": "name",
            "minWidth": 160
        },
        {
            "label": "编号",
            "prop": "code",
            "minWidth": 180
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
    }
  ]
}
```

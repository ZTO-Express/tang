最常用的表单文本控件。对应组件 CFormItemText。

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
          "text1": "这里展示文本1的值",
          "text2": "这里展示文本2的值"
        }
      }
    },
    "submit": { "api": "api.submitData" }
  },
  "formItems": [
    {
      "label": "文本1",
      "type": "text",
      "prop": "text1",
      "span": 24
    },
    {
      "label": "文本2",
      "type": "text",
      "prop": "text2",
      "span": 24
    },
    {
      "label": "文本3",
      "type": "text",
      "prop": "text3",
      "span": 24,
      "emptyText": "暂未反馈结果",
    },
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
      "enum": "text",
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
      "name": "tpl",
      "desc": "模板",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "formatter",
      "desc": "文本格式化",
      "type": "string/object/function",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "emptyText",
      "desc": "无数据时展示",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "style",
      "desc": "CSS样式",
      "type": "object",
      "enum": "",
      "default": "",
      "required": false
    }
  ]
}
```

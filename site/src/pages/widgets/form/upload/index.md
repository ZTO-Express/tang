最常用的表单上传控件。对应组件 CFormItemUpload。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "label": "上传照片",
      "type": "upload",
      "prop": "temporaryImg",
      "multiple": true,
      "uploadAttrs": {
        "dialogTitle": "照片上传"
      },
      "listAttrs": {
        "readonly": true
      },
      "listType": "image",
      "countLimit": 3,
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
      "desc": "类型",
      "type": "string",
      "enum": "upload",
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
      "name": "disabled",
      "desc": "不可选",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "multiple",
      "desc": "多选",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "uploadAttrs",
      "desc": "上传属性对象",
      "type": "map",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "dialogTitle",
          "desc": "上传弹窗的标题",
          "type": "string",
          "default": ""
        },
      ]
    },
    {
      "name": "listAttrs",
      "desc": "上传列表属性对象",
      "type": "map",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "readonly",
          "desc": "只读",
          "type": "true/false",
          "default": false
        },
      ]
    },
    {
      "name": "listType",
      "desc": "上传列表属性类型",
      "type": "string",
      "enum": "file/image",
      "default": "file",
      "required": false,
      "children": [
        {
          "name": "readonly",
          "desc": "只读",
          "type": "true/false",
          "default": false
        },
      ]
    },
    {
      "name": "countLimit",
      "desc": "数量限制",
      "type": "number",
      "enum": "",
      "default": 10,
      "required": false,
    },
    {
      "name": "sizeLimit",
      "desc": "文件大小限制, 默认5，单位MB",
      "type": "number",
      "enum": "",
      "default": "5",
      "required": false,
    },
    {
      "name": "accept",
      "desc": "接受类型",
      "type": "number",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "openFile",
      "desc": "打开文件",
      "type": "boolean",
      "enum": "true/false",
      "default": true,
      "required": false,
    },
    {
      "name": "closeWhenCompleted",
      "desc": "当完成后关闭弹窗",
      "type": "boolean",
      "enum": "true/false",
      "default": true,
      "required": false,
    },
    {
      "name": "autoUpload",
      "desc": "自动上传",
      "type": "boolean",
      "enum": "true/false",
      "default": false,
      "required": false,
    },
    {
      "name": "tip",
      "desc": "提示文案",
      "type": "boolean/string/object",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "onCompleted",
      "desc": "完成回调",
      "type": "function",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "onDelete",
      "desc": "删除回调",
      "type": "function",
      "enum": "",
      "default": "",
      "required": false,
    }
  ]
}
```

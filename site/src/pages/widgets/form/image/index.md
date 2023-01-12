最常用的表单图片控件。对应组件 CFormItemImage。

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
          "image1": "https://pic.3gbizhi.com/2019/0928/20190928012439343.jpg",
          "image2": "https://pic.3gbizhi.com/2019/0928/20190928012439343.jpg"
        }
      }
    },
    "submit": { "api": "api.submitData" }
  },
  "formItems": [
    {
      "label": "照片1",
      "type": "image",
      "prop": "image1",
    },
    {
      "label": "照片2",
      "type": "image",
      "prop": "image2",
      "title": "标题",
      "autoHeight": true
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
      "name": "title",
      "desc": "标题",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "fit",
      "desc": "确定图片如何适应容器框",
      "type": "fill/contain/cover/none/scale-down",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "emptyText",
      "desc": "无数据时展示",
      "type": "string",
      "enum": "",
      "default": "暂无图片",
      "required": false,
    },
    {
      "name": "preview",
      "desc": "预览",
      "type": "boolean",
      "enum": "true/false",
      "default": true,
      "required": false
    },
    {
      "name": "hideOnClickModal",
      "desc": "点击蒙层隐藏",
      "type": "boolean",
      "enum": "true/false",
      "default": true,
      "required": false
    },
  ]
}
```

最常用的表单视频控件。对应组件 CFormItemVideo。

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
          "video1": "https://pic.3gbizhi.com/2019/0928/20190928012439343.mp4",
          "video2": "https://pic.3gbizhi.com/2019/0928/20190928012439343.mp4"
        }
      }
    },
    "submit": { "api": "api.submitData" }
  },
  "formItems": [
    {
      "label": "视频1",
      "type": "video",
      "prop": "video1",
    },
    {
      "label": "视频2",
      "type": "video",
      "prop": "video2",
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
      "enum": "video",
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
    }
  ]
}
```

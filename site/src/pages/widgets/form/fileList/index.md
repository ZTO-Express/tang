最常用的文件列表控件。对应组件 CFormItemFileList。

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
          "fileList1": "https://xxx.com/file1-1.docx,https://xxx.com/file2-1.xlsx",
          "fileList2": [
            "https://xxx.com/file1-2.docx",
            "https://xxx.com/file2-2.xlsx"
          ],
          "imageList1": "https://pic.3gbizhi.com/2019/0928/20190928012439343.jpg",
          "imageList2": [
            "https://pic.3gbizhi.com/2019/0928/20190928012439343.jpg",
            "https://pic3.zhimg.com/v2-58d652598269710fa67ec8d1c88d8f03_r.jpg?source=1940ef5c"
          ]
        }
      }
    },
    "submit": { "api": "api.submitData" }
  },
  "formItems": [
    {
      "type": "file-list",
      "label": "文件列表1",
      "prop": "fileList1",
      "listType": "file",
      "readonly": false,
      "required": true,
      "autoHeight": true,
      "span": 24
    },
    {
      "type": "file-list",
      "label": "文件列表2",
      "prop": "fileList2",
      "listType": "file",
      "readonly": true,
      "required": false,
      "autoHeight": true,
      "span": 24
    },
    {
      "type": "file-list",
      "label": "图片列表1",
      "prop": "imageList1",
      "listType": "image",
      "readonly": false,
      "downloadable": true,
      "required": true,
      "autoHeight": true,
      "span": 24
    },
    {
      "type": "file-list",
      "label": "图片列表2",
      "prop": "imageList2",
      "listType": "image",
      "readonly": true,
      "required": false,
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
      "enum": "file-list",
      "default": "",
      "required": false,
    },
    {
      "name": "listType",
      "desc": "类型",
      "type": "string",
      "enum": "file/image",
      "default": "file",
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
      "name": "readonly",
      "desc": "只读",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "downloadable",
      "desc": "是否下载",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "noPadding",
      "desc": "无边距",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "showNoData",
      "desc": "无数据",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "withoutPostfix",
      "desc": "",
      "type": "boolean",
      "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "maxItemWidth",
      "desc": "最大宽度",
      "type": "string",
      "enum": "",
      "default": "200px",
      "required": false,
    },
    {
      "name": "srcType",
      "desc": "路径类型",
      "type": "string",
      "enum": "path/url",
      "default": "path",
      "required": false,
    },
    {
      "name": "imageOptions",
      "desc": "图片选项",
      "type": "object",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "downloadMethod",
      "desc": "下载",
      "type": "function",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "remoteDelete",
      "desc": "远程删除",
      "type": "boolean",
       "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "immediateDelete",
      "desc": "删除操作时，直接删除指定项",
      "type": "boolean",
       "enum": "true/false",
      "default": "false",
      "required": false,
    },
    {
      "name": "params",
      "desc": "额外的参数",
      "type": "string",
       "enum": "",
      "default": "",
      "required": false,
    },
  ]
}
```

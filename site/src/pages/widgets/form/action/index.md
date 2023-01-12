最常用的表单活动按钮控件。对应组件 CFormItemAction。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---

{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "action",
      "label": "基本按钮",
      "name": "按钮",
      "buttonType": "primary",
    }
  ]
}
```

### 文本按钮示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "action",
      "label": "文本按钮",
      "name": "按钮",
      "buttonType": "text",
    }
  ]
}
```

### 导入按钮示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "action",
      "label": "导入按钮",
      "actionType": "import",
      "name": "导入",
      "import": {
        "title": "导入",
        "api": "kdcs.advanceBatchImport",
        "template": "operate_store_advanceFund",
        "maxCount": 1000,
        "extraTip": {
          "html": {
            "tag": "div",
            "children": [
              {
                "tag": "h5",
                "children": [
                    "导入说明："
                ]
              },
              {
                "tag": "ul",
                "props": {
                  "class": "li-decimal text-small"
                },
                "children": [
                  {
                    "tag": "li",
                    "children": [
                        "门店编号必填；"
                    ]
                  },
                  {
                    "tag": "li",
                    "children": [
                        "门店编号必须为系统已存在的门店；"
                    ]
                  },
                  {
                    "tag": "li",
                    "children": [
                        "已标记的门店不可重复导入；"
                    ]
                  },
                  {
                    "tag": "li",
                    "children": [
                        "已装修认证通过的门店不可导入；"
                    ]
                  },
                  {
                    "tag": "li",
                    "children": [
                        "门店认证未通过的门店不支持导入；"
                    ]
                  },
                  {
                    "tag": "li",
                    "children": [
                        "数据填写完成后请删除导入说明再导入"
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ]
}
```

### 弹窗按钮示例

```json
// --- doc-sample:zpage-widget ---

{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "action",
      "label": "弹窗按钮",
      "buttonType": "dialog",
      "name": "弹窗",
      "dialog": {
        "title": "新增",
        "formItems": [
          {
            "label": "名称",
            "type": "input",
            "prop": "name",
            "required": true,
            "span": 24
          }
        ]
      },
      "api": "edit",
      "apiParams": {
        "id": 1
      },
      "contextData": null,
      "innerAttrs": {
        "dialog": {}
      }
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
      "enum": "action",
      "default": "",
      "required": false,
    },
    {
      "name": "label",
      "desc": "按钮名称",
      "type": "string",
      "enum": "",
      "default": "",
      "required": false,
    },
    {
      "name": "buttonType",
      "desc": "按钮类型",
      "type": "string",
      "enum": "primary/text/import/dialog/form/download/link/event",
      "default": "primary",
      "required": false,
    },
    {
      "name": "import",
      "desc": "导入对象",
      "type": "map",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "title",
          "desc": "导入弹窗的标题",
          "type": "string",
          "default": "导入"
        },
        {
          "name": "api",
          "desc": "导入接口api的url",
          "type": "string",
          "default": ""
        },
        {
          "name": "template",
          "desc": "下载模板",
          "type": "string",
          "default": ""
        },
        {
          "name": "maxCount",
          "desc": "数据最大条数",
          "type": "number",
          "default": ""
        },
        {
          "name": "extraTip",
          "desc": "扩展字段",
          "type": "map",
          "default": "",
          "children": [
            {
              "name": "html",
              "desc": "html",
              "type": "map",
              "default": "",
              "children": [
                {
                  "name": "tag",
                  "desc": "html标签",
                  "type": "string",
                  "default": ""
                },
                {
                  "name": "children",
                  "desc": "子标签",
                  "type": "array",
                  "default": "",
                  "children": [
                    {
                      "name": "...",
                      "desc": "其他",
                      "type": "",
                      "default": ""
                    },
                  ]
                },
              ]
            },
          ]
        },
      ]
    },
    {
      "name": "dialog",
      "desc": "弹窗对象",
      "type": "map",
      "default": "",
      "required": false,
      "children": [
        {
          "name": "title",
          "desc": "导入弹窗的标题",
          "type": "string",
          "default": "导入"
        },
      ]
    }
  ]
}
```

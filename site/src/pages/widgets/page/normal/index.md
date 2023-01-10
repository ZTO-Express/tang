普通页为 ZPage 默认顶层微件。其定义了 ZPage 的单个页面布局，并提供初始化了生命周期。

## 基本用法

最基本的用法是配置 数据源接口(api) 以及 展示列(columns)

### 简单页面

```json
// --- doc-sample:zpage-widget ---
{
  "type": "page",
  "body": "页面内容"
}
```

### 自定义头部

默认页面标题取路由菜单标题，我们也可以通过 title 自己设置标题，并可添加头部提示。

```json
// --- doc-sample:zpage-widget ---
{
  "type": "page",
  "title": "页面1",
  "tip": {
    "html": "<b style=\"color:green;\">头部提示</b>"
  },
  "body": "页面内容"
}
```

### 隐藏头部

```json
// --- doc-sample:zpage-widget ---
{
  "type": "page",
  "noHeader": true,
  "body": "页面内容"
}
```

### Tab 页

```json
// --- doc-sample:zpage-widget ---
{
  "type": "page",
  "tabs": {
    "value": "page1",
    "showPane": true,
    "items": [
      { "label": "页1", "value": "page1", "body": "内容1" },
      { "label": "页2", "value": "page2", "body": "内容2" }
    ]
  }
}
```

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "title",
      "desc": "自定义页面标题",
      "type": "string",
      "default": "路由字符串",
      "required": false
    },
    {
      "name": "tip",
      "desc": "页面提示，如果是字符串则直接显示字符串。若为对象，此对象将作为CPoptip组件的属性进行渲染，详细配置可参考CPoptip组件。",
      "type": "string/object",
      "enum": "",
      "default": "",
      "children": [
        {
          "name": "html",
          "desc": "tip Html格式，详细属性参考html微件",
          "type": "string/object",
          "default": "路由字符串",
          "required": false
        }
      ]
    },
    {
      "name": "noHeader",
      "desc": "隐藏页面头",
      "type": "boolean",
      "enum": "true/false",
      "default": "false"
    },
    {
      "name": "noBack",
      "desc": "隐藏回退。当页面为跳转页面，默认将显示返回按钮，设置此属性将隐藏此返回按钮。",
      "type": "boolean",
      "enum": "true/false",
      "default": "false"
    },
    {
      "name": "tabs",
      "desc": "设置此属性且items有值后，页面将为tab页，详细请参考WPageTabs微件",
      "type": "object",
      "enum": "",
      "default": ""
    },
    {
      "name": "header",
      "desc": "页面头部定义内容，详细配置信息参考 CPageHeader组件。",
      "type": "object",
      "enum": "",
      "default": ""
    },
    {
      "name": "body",
      "desc": "页面内容。若为对象，则为内部widget schema内容。",
      "type": "string/object",
      "enum": "",
      "default": ""
    }
  ]
}
```

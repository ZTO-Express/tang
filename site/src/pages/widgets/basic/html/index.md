和 tpl 类似， html 一般会包含其他微件中使用，对应 运行时下面 WHtml 组件。其模版和上下文使用方式同[模版微件](#/widgets/basic/tpl)。

## 基本用法

Html 模版内变量为写法："普通字符串${模版变量}"。

### 字符串写法

字符串的写法是将字符串作为 innerHTML 内容进行渲染，如果对安全性要求较高的场景，可考虑使用对象写法。且对象

```json
// --- doc-sample:zpage-widget ---
{
  "type": "html",
  "contextData": { "var": "变量1" },
  "html": "我的模版<b style=\"color:red;\">${route.name}</b>,<b style=\"color:green;\">${data.var}</b>"
}
```

### 对象写法

```json
// --- doc-sample:zpage-widget ---
{
  "type": "html",
  "contextData": { "var": "变量1" },
  "html": {
    "tag": "span",
    "props": { "style": { "color": "red" } },
    "children": [
      "内容1",
      {
        "props": { "style": { "color": "green" } },
        "children": "内容2"
      },
      {
        "tag": "span",
        "props": { "style": { "color": "blue" } },
        "children": "内容3"
      },
      {
        "tag": "span",
        "visibleOn": "!this.data.var",
        "children": "隐藏内容"
      }
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
      "name": "html",
      "desc": "html字符串或对象，详情参考CHtml组件。当html为function时，将执行以页面上下文为参数的字段，返回值为实际html参数值。",
      "type": "string/function/object",
      "default": "",
      "children": [
        {
          "name": "tag",
          "desc": "html标签",
          "type": "string",
          "enum": "",
          "default": "div"
        },
        {
          "name": "props",
          "desc": "html标签属性",
          "type": "object",
          "enum": "",
          "default": ""
        },
        {
          "name": "children",
          "desc": "html内容，或子html对象",
          "type": "array[string|object]",
          "enum": "",
          "default": "",
          "required": true
        },
        {
          "name": "visibleOn",
          "desc": "是否显示运算模版",
          "type": "string",
          "default": ""
        }
      ]
    },
    {
      "name": "contextData",
      "desc": "上下文数据",
      "type": "object",
      "enum": "",
      "default": ""
    }
  ]
}
```

和 tpl 类似， html 一般会包含其他微件中使用。其中可包含模版变量和

## 基本用法

模版内变量为写法："普通字符串${模版变量}"。

### 显示

```json
// --- doc-sample:zpage-widget ---
{
  "type": "tpl",
  "contextData": { "var": "变量1" },
  "tpl": "我的模版${route.name},${data.var}"
}
```

## Schema

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "tpl",
      "desc": "模版字符串，详情参考CTpl组件",
      "type": "string",
      "default": ""
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

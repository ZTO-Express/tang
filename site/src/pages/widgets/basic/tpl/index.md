模版微件一般会包含其他微件中使用。模版的上下文为当前页面或表单上下文。

模版的实现利用 lodash/template 功能，使用方式参考：<a href="https://aisuda.bce.baidu.com/amis/zh-CN/docs/concepts/template" target="_blank">amis 模版</a>。在模版中可以使用过滤器，过滤器功能可参考：<a href="https://aisuda.bce.baidu.com/amis/zh-CN/docs/concepts/data-mapping" target="_blank">amis 数据映射</a>

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

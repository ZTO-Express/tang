Html控件。对应组件 CFormItemHtml。

## 用法

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

见[基础/Html](/#/widgets/basic/html)

Tab 页也是日常常用的页面布局。目前 Tab 页主要使用的是 WPageTabs 微件。

## 用法

此微件在 Tab 项切换时会触发$global_page_tab_change 事件，子组件可利用此事件进行切换时刷新功能。

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "page-tabs",
  "default": "page1",
  "items": [
    { "label": "页1", "value": "page1", "perm": "no_perm", "body": "内容1" },
    { "label": "页2", "value": "page2", "body": "内容2" },
    {
      "label": "页3",
      "value": "page3",
      "body": {
        "type": "html",
        "html": "<b style=\"color:red;\">内容3</b>"
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
      "name": "items",
      "desc": "Tab项",
      "type": "array",
      "enum": "",
      "default": "",
      "children": [
        {
          "name": "label",
          "desc": "tab项标签",
          "type": "string",
          "default": ""
        },
        {
          "name": "value",
          "desc": "tab项标签值，此值唯一标识tab",
          "type": "string",
          "default": "",
          "required": true
        },
        {
          "name": "perm",
          "desc": "tab项标签权限，当用户没有此权限，此tab将对用户隐藏",
          "type": "string/string[]",
          "default": ""
        },
        {
          "name": "body",
          "desc": "tab项内容，为模版字符串或widget schema。注意：此内容在tab加载时会全部加载，如果有初始化api请求，需要考虑性能。",
          "type": "string/object",
          "default": ""
        }
      ]
    },
    {
      "name": "default",
      "desc": "默认显示的tab的标签值。若未设置或未找到指定的默认项，将默认显示第一个tab页。",
      "type": "string",
      "default": "",
      "required": false
    }
  ]
}
```

用于选择或输入日期。对应组件 CFormItemDateTimePicker。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "date-time-picker",
      "prop": "sendTime",
      "label": "发送时间"
    }
  ]
}
```

## Schema

其他属性参考<a href="https://element-plus.gitee.io/zh-CN/component/datetime-picker.html" target="_blank">Element Pluse DateTimePicker 属性</a>

```json
// --- doc-schema:definition ---
{
  "properties": [
    {
      "name": "model",
      "desc": "form表单的model",
      "type": "object",
      "default": "",
      "required": true
    },
    {
      "name": "prop",
      "desc": "formItem中对应的model中的key",
      "type": "string",
      "default": "",
      "required": true
    }
  ]
}
```

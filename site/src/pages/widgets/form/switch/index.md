表示两种相互对立的状态间的切换，多用于触发「开/关」。对应组件 CFormItemSwitch。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    { "label": "开关1", "type": "switch", "prop": "switch1", "activeValue": 1, "inactiveValue": 0 },
    { "label": "开关2", "type": "switch", "prop": "switch2", "disabled": true }
  ]
}
```

## Schema

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
    },
    {
      "name": "activeValue",
      "desc": "switch 状态为 on 时的值	",
      "type": "boolean / string / number",
      "default": "true",
      "required": false
    },
    {
      "name": "inactiveValue",
      "desc": "switch的状态为 off 时的值",
      "type": "boolean / string / number",
      "default": "false",
      "required": false
    },
    {
      "name": "beforeChange",
      "desc": "switch 状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换",
      "type": "function",
      "default": "",
      "required": false
    },
    {
      "name": "disabled",
      "desc": "是否禁用",
      "type": "boolean",
      "default": "false",
      "required": false
    }
  ]
}
```

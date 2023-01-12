仅允许输入标准的数字值，可定义范围。对应组件 CFormItemInputNumber。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    { "label": "输入1", "type": "inputNumber", "prop": "input1", "controlsPosition": "left", "required": true },
    { "label": "输入2", "type": "inputNumber", "prop": "input2", "min": 1, "max": 10 }
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
      "name": "controlsPosition",
      "desc": "控制按钮位置",
      "type": "string",
      "enum": "left/right",
      "default": "right",
      "required": false
    },
    {
      "name": "min",
      "desc": "设置计数器允许的最小值",
      "type": "number",
      "enum": "",
      "default": "0",
      "required": false
    },
    {
      "name": "max",
      "desc": "设置计数器允许的最大值",
      "type": "number",
      "enum": "",
      "default": "",
      "required": false
    },
    {
      "name": "disabled",
      "desc": "是否禁用状态",
      "type": "boolean",
      "enum": "",
      "default": "false",
      "required": false
    }
  ]
}
```

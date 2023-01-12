最常用的表单输入控件。对应组件 CFormItemInput。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    { "label": "输入1", "type": "input", "prop": "input1", "required": true, "placeholder": "请填写版本号" },
    { "label": "输入2", "type": "input", "prop": "input2" }
  ]
}
```

## Schema

其他属性参考<a href="https://element-plus.gitee.io/zh-CN/component/input.html" target="_blank">Element Pluse Input 属性</a>

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
      "name": "inputType",
      "desc": "设置input类型",
      "type": "string",
      "default": "text",
      "required": false
    },
    {
      "name": "maxlength",
      "desc": "最大输入长度",
      "type": "number",
      "default": "",
      "required": false
    },
    {
      "name": "showWordLimit",
      "desc": "是否显示统计字数",
      "type": "boolean",
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

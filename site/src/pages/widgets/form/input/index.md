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

```json
// --- doc-schema:definition ---
{
  "properties": [
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

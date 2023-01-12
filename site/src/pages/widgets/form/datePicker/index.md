用于选择或输入日期。对应组件 CFormItemDatePicker。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "date-picker",
      "prop": "date",
      "label": "扫描日期",
      "minDate": "2023-01-10",
      "default": "now"
    },
    {
      "type": "date-picker",
      "prop": "month",
      "label": "扫描日期",
      "pickerType": "month",
      "beforeToday": false,
      "afterToday": true,
      "default": "now"
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
      "name": "pickerType",
      "desc": "用来设置日期类型，比如date, week, month, year, dates",
      "type": "string",
      "default": "date",
      "required": false
    },
    {
      "name": "valueFormat",
      "desc": "用来指定绑定值的格式",
      "type": "string",
      "default": "YYYY-MM-DD HH:mm:ss",
      "required": false
    },
    {
      "name": "disabled",
      "desc": "开启禁用",
      "type": "boolean",
      "default": "false",
      "required": false
    },
    {
      "name": "beforeToday",
      "desc": "对当前日期未来的日期，进行禁用启用，如果为true, 表示禁用，false则为启用",
      "type": "boolean",
      "default": "true",
      "required": false
    },
    {
      "name": "afterToday",
      "desc": "对当前日期过去的日期，进行禁用启用，如果为true, 表示禁用，false则为启用",
      "type": "string",
      "default": "",
      "required": false
    },
    {
      "name": "minDate",
      "desc": "用来指定可选择的最小日期",
      "type": "string / date",
      "default": "",
      "required": false
    },
    {
      "name": "maxDate",
      "desc": "用来指定可选择的最大日期",
      "type": "string / date",
      "default": "",
      "required": false
    },

    {
      "name": "disabledDate",
      "desc": "一个用来判断该日期是否被禁用的函数, 接受一个 Date 对象作为参数。 应该返回一个 Boolean 值",
      "type": "function",
      "default": "",
      "required": false
    },
    {
      "name": "onChange",
      "desc": "用户确认选定的值时触发",
      "type": "function",
      "default": "",
      "required": false
    }
  ]
}
```

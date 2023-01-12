用于选择或输入日期范围。对应组件 CFormItemDateRangePicker。

## 用法

### 常用示例

```json
// --- doc-sample:zpage-widget ---
{
  "type": "form",
  "actions": { "submit": { "api": "api.submitData" } },
  "formItems": [
    {
      "type": "date-range-picker",
      "prop": "startTime",
      "toProp": "endTime",
      "label": "扫描日期",
      "defaultTo": "now",
      "clearable": false,
      "defaultRange": 2,
      "maxRange": 31,
      "beforeToday": false,
      "afterToday": true
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
      "desc": "开始日期对应的 key",
      "type": "string",
      "default": "",
      "required": true
    },
    {
      "name": "toProp",
      "desc": "结束日期对应的 key",
      "type": "string",
      "default": "",
      "required": true
    },
    {
      "name": "valueFormat",
      "desc": "用来指定绑定值的格式",
      "type": "string",
      "default": "YYYY-MM-DD",
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
      "default": "false",
      "required": false
    },
    {
      "name": "afterToday",
      "desc": "对当前日期过去的日期，进行禁用启用，如果为true, 表示禁用，false则为启用",
      "type": "string",
      "default": "false",
      "required": false
    },
    {
      "name": "beforeDate",
      "desc": "用来指定可选日期的最大时间",
      "type": "string / date",
      "default": "",
      "required": false
    },
    {
      "name": "afterDate",
      "desc": "用来指定可选日期的最小时间",
      "type": "string / date",
      "default": "",
      "required": false
    },
    {
      "name": "defaultFrom",
      "desc": "用来指定默认开始时间",
      "type": "string | Date",
      "default": "",
      "required": false
    },
    {
      "name": "defaultTo",
      "desc": "用来指定默认结束时间",
      "type": "string | Date",
      "default": "",
      "required": false
    },
    {
      "name": "defaultRange",
      "desc": "默认时间范围",
      "type": "number",
      "default": 1,
      "required": false
    },
    {
      "name": "maxRange",
      "desc": "默认最大时间范围",
      "type": "number",
      "default": 0,
      "required": false
    },
    {
      "name": "unlinkPanels",
      "desc": "在范围选择器里取消两个日期面板之间的联动",
      "type": "boolean",
      "default": false,
      "required": false
    },
    {
      "name": "appendTime",
      "desc": "在年月日的时间后面，是否加上时分秒",
      "type": "boolean",
      "default": true,
      "required": false
    }
  ]
}
```

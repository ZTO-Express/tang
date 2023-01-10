---
title: 'DateRangePicker'
etc: '...'
---

# DateRangePicker 日期范围选择器

用于选择或输入日期范围

### 基本用法

你可以通过如下例子来学习如何设置一个日期范围选择器。

```vue
--- doc-sample:sfc ---
dateRangePicker/basic
```

### 禁用状态

disabled 属性可以用来控制日期范围选择器的禁用状态。

你只需要为日期范围选择器设置 disabled 属性就能控制其禁用状态。

```vue
--- doc-sample:sfc ---
dateRangePicker/disabled
```

### 只读状态

readonly 属性可以用来控制日期范围选择器的只读状态。

你只需要为日期范围选择器设置 readonly 属性就能控制其只读状态。

```vue
--- doc-sample:sfc ---
dateRangePicker/readonly
```

### DateRangePicker API

#### DateRangePicker 属性

| 属性                  | 说明                               | 类型                           | 默认值 |
| --------------------- | ---------------------------------- | ------------------------------ | ------ |
| model-value / v-model | 绑定值，如果它是数组，长度应该是 2 | Date / number / string / Array | -      |
| clearable             | 是否显示清除按钮                   | boolean                        | false  |
| disabled              | 禁用                               | boolean                        | false  |
| readonly              | 只读                               | boolean                        | false  |
| rangeSeparator | 分隔符 | string | '-'
| start-placeholder | 范围选择时开始日期的占位内容 | string | -
| end-placeholder | 范围选择时结束日期的占位内容 | string | -
| valueFormat | 绑定值的格式 | string | YYYY-MM-DD
| beforeDate | 可选最大时间 | string / Date | -
| afterDate | 可选最小时间 | string / Date | -
| defaultFrom | 默认开始日期 | string / Date | -
| defaultTo | 默认结束日期 | string / Date | -
| defaultRange | 默认日期范围（天） | number | 1
| maxRange | 默认最大日期范围（天）、0为无限制 | number | 0
| from | 开始日期 | string / Date | -
| to | 结束日期 | string / Date | -
| unlinkPanels | 在范围选择器里取消两个日期面板之间的联动 | boolean | false
| appendTime | 同步时附加时分秒（如：2019-01-01, 2019-01-01；将会附加为：2019-01-01 00:00:00, 2019-01-01 23:59:59） | boolean | true

---
title: 'Checkbox'
etc: '...'
---

# Checkbox 多选框

在一组备选项中进行多选。

### 基本用法
单独使用可以表示两种状态之间的切换，写在标签中的内容为 checkbox 按钮后的介绍。

```vue
--- doc-sample:sfc ---
checkbox/basic
```

### 禁用状态
多选框不可用状态。

设置 disabled 属性即可。

```vue
--- doc-sample:sfc ---
checkbox/disabled
```

### 多选框组
适用于多个勾选框绑定到同一个数组的情景，通过是否勾选来表示这一组选项中选中的项。

```vue
--- doc-sample:sfc ---
checkbox/group
```

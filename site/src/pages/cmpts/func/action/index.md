---
title: 'Actions'
etc: '...'
---

# Action 行为按钮

Action 行为按钮，是触发页面行为的主要方法之一

### 基本用法
通过设置 `disabled` 属性来定义按钮是否被禁用。

```vue
--- doc-sample:sfc ---
action/basic
```

### 上传
通过设置 `actionType` 属性为 `upload` 来显示上传的状态。

```vue
--- doc-sample:sfc ---
action/upload
```

### 弹窗
通过设置 `dialog` 属性为来定义按钮点击后是否显示弹窗。

```vue
--- doc-sample:sfc ---
action/dialog
```

### 导入
通过设置 `actionType` 属性为 `import` 来显示导入弹窗的状态或者直接传入`import`对象。

```vue
--- doc-sample:sfc ---
action/import
```

### Action API

#### Action 属性

| 属性        | 说明         | 类型        |     默认值   |
| ----------- | ----------- | ----------- | ----------- |
| size      | 尺寸       | string      |        |



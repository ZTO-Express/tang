<template>
  <div class="c-more-action q-ml-sm">
    <el-tooltip v-bind="$attrs">
      <el-button type="text">
        {{ $attrs.label || '更多操作' }}
        <i class="el-icon-arrow-down"></i>
      </el-button>
      <template #content>
        <slot></slot>
      </template>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.c-more-action {
  display: inline-block;
}
</style>

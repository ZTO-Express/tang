<template>
  <el-button type="primary" v-preventReclick v-bind="$attrs" :type="$attrs.buttonType" v-perm="$attrs.perms">
    {{ $attrs.label }}
  </el-button>
</template>

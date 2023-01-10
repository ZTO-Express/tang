<template>
  <el-form-item v-if="item.label !== undefined" label="label" prop="label">
    <el-input v-model="item.label" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item v-if="item.api !== undefined" label="api" prop="api">
    <el-input v-model="item.api" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item v-if="item.searchParamProp !== undefined" label="searchParamProp" prop="searchParamProp">
    <el-input v-model="item.searchParamProp" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item v-if="item.exportType !== undefined" label="exportType" prop="exportType">
    <el-input v-model="item.exportType" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item
    v-if="item.apiParams !== undefined"
    label="apiParams"
    prop="apiParams"
    class="c-form-item__content__heightauto"
  >
    <template v-for="(param, key) of item.apiParams" :key="key">
      <div class="c-form-item__label">{{ key }}</div>
      <el-input v-model="item.apiParams[key]" placeholder="请输入" style="width: 100%"></el-input>

      <!-- <el-form-item :label="key" :prop="key">
        <el-input v-model="item.apiParams[key]" placeholder="请输入" style="width: 100%"></el-input>
      </el-form-item> -->
    </template>
  </el-form-item>
  <el-form-item
    v-if="item.exSearchParams !== undefined"
    label="exSearchParams"
    prop="exSearchParams"
    class="c-form-item__content__heightauto"
  >
    <template v-for="(param, key) of item.exSearchParams" :key="key">
      <div class="c-form-item__label">{{ key }}</div>
      <el-input v-model="item.exSearchParams[key]" placeholder="请输入" style="width: 100%"></el-input>
    </template>
  </el-form-item>
  <el-form-item v-if="item.perm !== undefined" label="perm" prop="perm">
    <el-input v-model="item.perm" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from '@zto/zpage'

const props = defineProps<{
  item: any
  index: any
}>()

const item = ref<any>(null)

onMounted(() => {
  item.value = props.item
})

watch(
  () => props.item,
  () => {
    item.value = props.item
  },
  { immediate: true, deep: true }
)
</script>

<style>
.c-form-item__label {
  flex: 0 0 auto;
  /* text-align: right; */
  font-size: var(--el-form-label-font-size);
  color: var(--el-text-color-regular);
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

.el-form-item--mini .c-form-item__label {
  line-height: 28px;
}

.c-form-item__content__heightauto .el-form-item__content {
  height: auto;
}
</style>

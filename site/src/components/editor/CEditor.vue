<template>
  <!-- header -->
  <CEditorHeader :schema="schema" @preview="handlePreview"></CEditorHeader>
  <section>
    <!-- setting -->
    <CEditorSetting v-show="!isPreview" :schema="schema" class="setting-wrapper"></CEditorSetting>
    <!-- preview -->
    <CEditorPreview :schema="schema" :class="{ 'preview-wrapper': !isPreview }"></CEditorPreview>
  </section>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'
import crudSchema from './demo/crud/index'

const schema = ref<any>(null)
schema.value = crudSchema.body

const isPreview = ref(false)

const handlePreview = value => {
  isPreview.value = value
}
</script>

<style lang="scss" scoped>
section {
  display: flex;
  height: calc(100% - 40px);

  .preview-wrapper {
    width: calc(100% - 500px);
    // border-right: 1px solid #999;
    box-sizing: border-box;
  }

  .setting-wrapper {
    width: 500px;
  }
}
</style>

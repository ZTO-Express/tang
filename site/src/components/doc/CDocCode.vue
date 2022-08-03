<template>
  <div class="c-doc-code">
    <div v-if="meta === 'zpage-widget'" class="widget-body">
      <!-- widgetSchema: {{ widgetSchema }} -->
      <widget v-if="widgetSchema" :schema="widgetSchema" />
    </div>

    <el-button type="text" @click="handleViewCode">查看代码</el-button>
    <!-- collapseName: {{ collapseName }} | {{ lang }} | {{ meta }} -->

    <div v-if="collapseName === 'code'" class="code-view">{{ code }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
import { computed } from 'vue'

const props = defineProps<{
  lang?: string
  code?: string
  meta?: string
}>()

const collapseName = ref<string>('')

const widgetSchema = computed(() => {
  if (!props.code) return null
  try {
    let s = JSON.parse(props.code)
    s.type = s.type || 'html'
    return s
  } catch (ex: any) {
    return {
      type: 'html',
      html: ex?.message
    }
  }
})

function handleViewCode() {
  collapseName.value = collapseName.value === 'code' ? '' : 'code'
}
</script>

<style lang="scss" scoped>
.sample-collapse {
  :deep(.el-collapse-item__header) {
    display: none;
  }
}
</style>

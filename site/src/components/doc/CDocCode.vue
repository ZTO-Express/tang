<template>
  <div class="c-doc-code">
    <div v-if="meta === 'zpage-widget'" class="widget-body">
      <!-- widgetSchema: {{ widgetSchema }} -->
      <widget v-if="widgetSchema" :schema="widgetSchema" />
    </div>

    <component :is="currentComponent" v-else-if="meta === 'sfc'"></component>

    <!-- collapseName: {{ collapseName }} | {{ lang }} | {{ meta }} -->

    <el-button type="text" @click="handleViewCode">查看代码</el-button>
    <!-- <div v-if="collapseName === 'code'" class="code-view">{{ code }}</div> -->

    <div v-if="collapseName === 'code'" class="code-view">
      <div v-html="prismCode"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
import ExampleMap from '../example/index'

const props = defineProps<{
  lang?: string
  code?: string
  prismCode?: string
  meta?: string
}>()

const collapseName = ref<string>('')

const widgetSchema = computed(() => {
  if (!props.code) return null
  try {
    const s = JSON.parse(props.code)
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

// 根据组件路径获取组件
const currentComponent = ref<any>(null)

watch(
  () => props.code,
  () => {
    currentComponent.value = ExampleMap[props.code as keyof typeof ExampleMap]
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.c-doc-code {
  padding: 5px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.sample-collapse {
  :deep(.el-collapse-item__header) {
    display: none;
  }
}
</style>

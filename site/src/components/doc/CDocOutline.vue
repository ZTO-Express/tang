<template>
  <div class="c-doc-outline">
    <div class="doc-wrapper">
      <div ref="docBodyRef" class="doc-body">
        <slot />
      </div>
      <div class="doc-nav">
        <el-affix :offset="100">
          <c-doc-toc-nav :headers="docHeaders" @anchor="handleNavAnchor" />
        </el-affix>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useCurrentAppInstance } from '@zto/zpage'
import { gotoAnchor, resolveDocHeaders } from './util'

import type { DocHeader } from './util'

const props = defineProps<{}>()

const app = useCurrentAppInstance()

const docBodyRef = ref()

const docHeaders = ref<DocHeader[]>([])

let observer: MutationObserver | undefined

// 只有开发环境监视文档内容变化
if (app.env.name === 'dev') {
  observer = new MutationObserver(() => {
    resolveHeaders()
  })
}

onMounted(() => {
  resolveHeaders()

  observer?.observe(docBodyRef.value, { subtree: true, childList: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
})

/** 点击nav触发 */
function handleNavAnchor(h: DocHeader) {
  if (!h) return

  // 滚动到指定目标
  gotoAnchor(h.anchor)
}

function resolveHeaders() {
  docHeaders.value = resolveDocHeaders(docBodyRef.value)
}
</script>

<style lang="scss" scoped>
.doc-wrapper {
  display: flex;

  & > .doc-body {
    flex: 1;
    padding: 0 10px;
  }

  & > .doc-nav {
    width: 200px;
    position: relative;

    :deep(.c-doc-toc-nav) {
      width: 200px;
    }
  }
}

@media only screen and (max-width: 1000px) {
  .doc-wrapper {
    & > .doc-nav {
      display: none;
    }
  }
}
</style>

<template>
  <div class="c-ui-perm-settings">
    <CUIBooleanStringSettings
      :property="property"
      :root-data="rootData"
      :data="data"
      @custom-status-change="handleCustomStatusChange"
    ></CUIBooleanStringSettings>
  </div>
</template>

<script setup lang="ts">
import { _, ref, computed, watch } from '@zto/zpage'

import { useUIProperty } from '../../utils'

import type { ZPageDevProperty } from '@/../typings'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

const { setPropertyValue } = useUIProperty(props)

/** 切换自定义状态时 */
function handleCustomStatusChange(enabled: boolean) {
  if (enabled) {
    setPropertyValue(props.data['api'] || '')
  }
}
</script>

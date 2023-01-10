<template>
  <div class="c-ui-boolean-string-settings">
    <CUIPropertyFormItems :property="property">
      <template #formBody>
        <el-switch v-model="isEnabled" @change="handleEnabledChange" />
      </template>
      <template #formExtra>
        <div class="form-extra">
          <label>自定义</label>
          <el-checkbox v-model="isCustomized" :disabled="isNotCustomizable" @change="handleCustomizedChange" />
        </div>
      </template>
    </CUIPropertyFormItems>
    <div v-if="isCustomized" class="custom-input">
      <el-input v-model="propString" @change="handlePropStringChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { _, ref, watch, onMounted } from '@zto/zpage'

import type { ZPageDevProperty } from '@/../typings'
import { useUIProperty } from '../../utils'
import { computed } from '@vue/reactivity'

const props = defineProps<{
  property: ZPageDevProperty
  rootData: any
  data: any
}>()

const emit = defineEmits(['custom-status-change', 'boolean-change', 'string-change', 'change'])

const { propertyValue, setPropertyValue, isValidDataProperty } = useUIProperty(props)

const isEnabled = ref(false)
const isCustomized = ref(false)

const propString = ref('')

const isNotCustomizable = computed(() => {
  return _.isUndefined(propertyValue.value) || propertyValue.value === false
})

watch(
  () => propertyValue.value,
  () => {
    if (!isValidDataProperty()) return

    // 权限值存在，则isEnabled为true
    if (propertyValue.value) {
      isEnabled.value = true
    }

    if (_.isString(propertyValue.value)) {
      propString.value = propertyValue.value
    }

    emit('change', propertyValue.value)
  }
)

onMounted(() => {
  if (_.isString(propertyValue.value)) {
    isCustomized.value = true
  }
})

/** 切换enabled */
function handleCustomizedChange() {
  if (isCustomized.value === false) {
    setPropertyValue(true)
  }

  emit('custom-status-change', isCustomized.value, propertyValue.value)
}

/** 切换enabled值 */
function handleEnabledChange() {
  setPropertyValue(isEnabled.value)

  emit('boolean-change', isCustomized.value, propertyValue.value)
}

/** 权限文本变化 */
function handlePropStringChange() {
  if (!isCustomized.value) return

  if (propString.value) {
    setPropertyValue(propString.value)
  } else {
    setPropertyValue(true)
  }

  emit('string-change', propString.value, propertyValue.value)
}
</script>

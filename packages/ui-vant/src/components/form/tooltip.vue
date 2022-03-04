<template>
  <van-popover v-model="showPopover" trigger="click" theme="dark" placement="right">
    <div class="form-item-tooltip">{{ tooltip }}</div>
    <van-icon slot="reference" name="info-o" />
  </van-popover>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'

const props = withDefaults(
  defineProps<{
    tooltip?: any
  }>(),
  {}
)

const { ref } = vue

const showPopover = ref<boolean>(false)
</script>

<style scoped lang="scss">
.form-item-tooltip {
  font-size: 0.37rem;
  width: 5rem;
  padding: 0.3rem;
}
</style>

<template>
  <el-popover :title="`批量编辑${item.label}`" type="primary" :before-ok="validate" @ok="ok">
    <template #content>
      <c-form ref="formRef" :model="formModel">
        <el-form-item :rules="item.rules" style="margin: 15px 0" :prop="item.prop">
          <component :is="editorType" v-bind="item.editor" :prop="item.prop" :model="formModel" />
        </el-form-item>
      </c-form>
    </template>
    <span class="z-pointer">
      {{ item.label }}
      <i class="z-icon-edit-outline" style="color: #3693ff"></i>
    </span>
  </el-popover>
</template>

<script setup lang="ts">
import { vue } from '@zpage/zpage'

const { reactive, ref } = vue

const props = withDefaults(
  defineProps<{
    item: Record<string, any>
    editorType: string
  }>(),
  {
    item: () => {
      return {}
    },
    editorType: ''
  }
)

const emit = defineEmits(['ok'])

const formModel = reactive<any>({
  [props.item?.prop]: ''
})

const formRef = ref<any>()

function validate() {
  return formRef.value?.validate()
}

function ok() {
  emit('ok', formModel.value)
}
</script>

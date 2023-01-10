<template>
  <el-row class="mb-4">
    <c-action v-bind="attrs1" class="mr-10"></c-action>
    <c-action v-bind="attrs2" class="mr-10"></c-action>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from '@zto/zpage'

const attrs1 = ref<any>({
  name: '新增',
  dialog: {
    formItems: [
      {
        label: '名称',
        type: 'input',
        prop: 'name',
        required: true,
        span: 24
      }
    ]
  },
  api: 'edit',
  apiParams: {
    id: 1
  },
  contextData: null,
  innerAttrs: {
    dialog: {
      // size: 'large'
    }
  },
  afterTrigger: () => {
    console.log('提交后，触发afterTrigger此回调')
  }
})

const addDialog = (isEdit = false) => {
  return {
    width: 800,
    labelWidth: 80,

    formItems: [
      {
        label: '名称',
        type: 'input',
        prop: 'name',
        required: true,
        span: 24
      },
      {
        label: '备注',
        type: 'textarea',
        prop: 'remark',
        rows: 2,
        maxlength: 200,
        autoHeight: true,
        required: true,
        span: 24
      }
    ]
  }
}

const attrs2 = ref<any>({
  name: '编辑',
  dialog: addDialog(),
  api: 'edit',
  apiParams: {
    id: 1
  },
  contextData: null,
  innerAttrs: {
    dialog: {
      // size: 'large'
    }
  },
  afterTrigger: () => {
    console.log('提交后，触发afterTrigger此回调')
  }
})
</script>

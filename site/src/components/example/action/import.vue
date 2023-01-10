<template>
  <el-row class="mb-4">
    <c-action v-bind="attrs1" class="mr-10"></c-action>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, uuid } from '@zto/zpage'

const attrs1 = ref<any>({
  name: '导入',
  import: {
    title: '导入弹窗',
    api: 'kdcs.advanceBatchImport',
    apiParams: () => ({ batchNum: uuid() }),
    template: 'operate_store_advanceFund',
    maxCount: 1000,
    extraTip: {
      html: {
        tag: 'div',
        children: [
          { tag: 'h5', children: ['导入说明：'] },
          {
            tag: 'ul',
            props: { class: 'li-decimal text-small' },
            children: [
              { tag: 'li', children: ['门店编号必填；'] },
              { tag: 'li', children: ['门店编号必须为系统已存在的门店；'] },
              { tag: 'li', children: ['已标记的门店不可重复导入；'] },
              { tag: 'li', children: ['已装修认证通过的门店不可导入；'] },
              { tag: 'li', children: ['门店认证未通过的门店不支持导入；'] },
              { tag: 'li', children: ['数据填写完成后请删除导入说明再导入'] }
            ]
          }
        ]
      }
    }
  }
})
</script>

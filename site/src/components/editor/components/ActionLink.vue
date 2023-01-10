<template>
  <el-form-item v-if="item.label !== undefined" label="label" prop="label">
    <el-input v-model="item.label" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item v-if="item.api !== undefined" label="api" prop="api">
    <el-input v-model="item.api" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>
  <el-form-item
    v-if="item.apiParams !== undefined"
    label="apiParams"
    prop="apiParams"
    class="c-form-item__content__heightauto"
  >
    <template v-for="(param, key) of item.apiParams" :key="key">
      <div class="c-form-item__label">{{ key }}</div>
      <el-input v-model="item.apiParams[key]" placeholder="请输入" style="width: 100%"></el-input>
    </template>
  </el-form-item>
  <el-form-item v-if="item.perm !== undefined" label="perm" prop="perm">
    <el-input v-model="item.perm" placeholder="请输入" style="width: 100%"></el-input>
  </el-form-item>

  <el-form-item v-if="item.link !== undefined" label="link" prop="link" class="c-form-item__content__heightauto">
    <template v-for="(param, key) of item.link" :key="key">
      <div class="c-form-item__label">{{ key }}</div>
      <el-input v-model="item.link[key]" placeholder="请输入" style="width: 100%"></el-input>
    </template>
  </el-form-item>

  <el-form-item v-if="item.dialog !== undefined" label="dialog" prop="dialog" class="c-form-item__content__heightauto">
    <!-- {{ item.dialog }} -->
    <el-button type="primary" @click="dialogVisible = true">{{ item.label }}</el-button>
    <!-- <c-action v-bind="item"></c-action> -->
    <!-- <template v-for="(param, key) of item.dialog" :key="key">
      <div class="c-form-item__label">{{ key }}</div>
      <el-input v-model="item.dialog[key]" placeholder="请输入" style="width: 100%"></el-input>
    </template> -->
  </el-form-item>

  <el-dialog v-model="dialogVisible" :title="item.label" width="80%" height="80%" top="15vh" style="height: 80vh">
    <section>
      <section class="setting-wrapper">
        <!-- {{ item.dialog.formItems }} -->
        <!-- 基础组件（可拖拽） -->
        <ESMeta :items="item.dialog.formItems" :group-name="groupName"></ESMeta>
        <!-- 编辑区 -->
        <div v-if="item.dialog" style="flex: 1">
          <!-- tab -->
          <!-- <el-radio-group v-model="activeName" style="padding: 4px">
            <el-radio-button label="basic">基础项</el-radio-button>
            <el-radio-button label="form">表单项</el-radio-button>
          </el-radio-group> -->

          <el-tabs v-model="activeName">
            <el-tab-pane label="基础项" name="basic"></el-tab-pane>
            <el-tab-pane label="表单项" name="form"></el-tab-pane>
          </el-tabs>

          <div v-if="item.dialog && activeName === 'basic'">
            <ESDialogBasic :item="item.dialog"></ESDialogBasic>
          </div>

          <div v-if="item.dialog.formItems.length && activeName === 'form'">
            <ESDraggable :lists="item.dialog.formItems" :group-name="groupName">
              <template #item="{ element, index }">
                <ESTypeCommon
                  v-if="['input', 'select', 'date-range-picker'].includes(element.type)"
                  :item="element"
                  :index="index"
                ></ESTypeCommon>

                <ESTypeOptions v-if="['select'].includes(element.type)" :item="element" :index="index"></ESTypeOptions>
              </template>
            </ESDraggable>
          </div>
        </div>
      </section>

      <section class="preview-wrapper">
        <!-- c-form -->
        <c-form ref="formRef" v-bind="dialogFormAttrs" :model="dataModel">
          <c-form-items v-bind="dialogFormItemsAttrs" :model="dataModel" :items="dialogFormItems"></c-form-items>
        </c-form>
      </section>
    </section>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed, useCurrentAppInstance } from '@zto/zpage'
import ESDraggable from './ESDraggable.vue'
import ESMeta from './ESMeta.vue'
import ESTypeCommon from './TypeCommon.vue'
import ESTypeOptions from './TypeOptions.vue'
import ESDialogBasic from './DialogBasic.vue'

const props = defineProps<{
  item: any
  // index: any
}>()

// 获取当前组件实例
const app = useCurrentAppInstance()

const item = ref<any>(null)

// 可拖拽groupName映射
const groupName = ref('')

onMounted(() => {
  item.value = props.item
})

const dialogVisible = ref(false)

const activeName = ref('basic')

watch(
  () => props.item,
  () => {
    item.value = props.item
  },
  { immediate: true, deep: true }
)

watch(
  () => activeName.value,
  val => {
    groupName.value = `dialog_${val}`
  },
  { immediate: true, deep: true }
)

const dataModel = ref<any>({})

const dialogFormItems = computed<any>(() => {
  if (typeof item.value.dialog.formItems === 'function') {
    const context = app.useContext(dataModel.value)
    return item.value.dialog.formItems(context)
  }
  return item.value.dialog.formItems || []
})

const dialogFormAttrs = computed(() => {
  const formAttrs = {
    labelWidth: item.value.dialog.labelWidth,
    ...item.value.dialog.innerAttrs?.form
  }
  return formAttrs
})

const dialogFormItemsAttrs = computed(() => {
  const formItemsAttrs = {
    showOperation: false,
    span: item.value.dialog.formItemSpan || item.value.dialog.itemSpan,
    ...item.value.dialog.innerAttrs?.formItems
  }
  return formItemsAttrs
})
</script>

<style lang="scss" scoped>
.c-form-item__label {
  flex: 0 0 auto;
  /* text-align: right; */
  font-size: var(--el-form-label-font-size);
  color: var(--el-text-color-regular);
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

.el-form-item--mini .c-form-item__label {
  line-height: 28px;
}

.c-form-item__content__heightauto .el-form-item__content {
  height: auto;
}

section {
  display: flex;
}

.setting-wrapper {
  width: 500px;
}

.preview-wrapper {
  width: calc(100% - 500px);
  box-sizing: border-box;
}

.drag-wrap {
  padding: 4px;
  border-bottom: 1px dotted #ddd;

  &:hover {
    background: #ddd;
    border-radius: 4px;
  }
}
.handle-dialog-search {
  cursor: move;
}
.el-icon-delete {
  cursor: pointer;
  float: right;
}
</style>

<!-- 编辑区域-主内容 -->
<template>
  <section>
    <!-- 根据schema渲染模块 -->
    <el-radio-group v-model="mainActive" style="margin: 10px 0">
      <el-radio-button v-for="(group, key) in mainGroups" :key="key" :label="group.value">
        {{ group.label }}
      </el-radio-button>
    </el-radio-group>

    <el-radio-group v-if="subMainGroup?.length" v-model="subMainActive" style="margin: 10px 0">
      <el-radio-button v-for="(group, key) in subMainGroup" :key="key" :label="group.value">
        {{ group.label }}
      </el-radio-button>
    </el-radio-group>

    <el-form ref="settingForm" class="setting-form-wrapper" :model="schema" label-width="100px">
      <!-- 可拖拽模块 -->
      <div v-if="schema?.[mainActive]?.items?.length" :key="mainActive">
        <ESDraggable :lists="schema?.[mainActive]?.items" :group-name="groupName">
          <template #item="{ element, index }">
            <ESTypeCommon
              v-if="['input', 'select', 'date-range-picker'].includes(element.type)"
              :item="element"
              :index="index"
            ></ESTypeCommon>

            <ESTypeOptions v-if="['select'].includes(element.type)" :item="element" :index="index"></ESTypeOptions>

            <ESActionExport v-if="element.action === 'export'" :item="element" :index="index"></ESActionExport>

            <ESActionLink v-else-if="element.action === 'link'" :item="element" :index="index"></ESActionLink>

            <ESActionDialog v-else-if="element.action === 'add'" :item="element" :index="index"></ESActionDialog>
          </template>
        </ESDraggable>
      </div>

      <!-- TODO: table 特殊 -->
      <div v-if="mainActive === 'table' && schema?.[mainActive]" :key="mainActive + '_' + subMainActive">
        <ESTableOperation
          v-if="subMainActive === 'basic'"
          :table="schema?.[mainActive]"
          :group-name="groupName"
        ></ESTableOperation>

        <ESDraggable
          v-if="subMainActive === 'columns'"
          :lists="schema?.[mainActive]?.[subMainActive]"
          :group-name="groupName"
        >
          <template #item="{ element, index }">
            <ESColumnsCommon v-if="subMainActive === 'columns'" :item="element" :index="index"></ESColumnsCommon>
          </template>
        </ESDraggable>
      </div>
    </el-form>
  </section>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from '@zto/zpage'
import ESDraggable from './ESDraggable.vue'
import ESTypeCommon from './TypeCommon.vue'
import ESTypeOptions from './TypeOptions.vue'
import ESActionExport from './ActionExport.vue'
import ESActionLink from './ActionLink.vue'
import ESActionDialog from './ActionDialog.vue'
import ESTableOperation from './TableOperation.vue'
import ESColumnsCommon from './ColumnsCommon.vue'

const props = withDefaults(
  defineProps<{
    schema: Record<string, any>
  }>(),
  {}
)
const emit = defineEmits(['drag-group'])

const schema = ref(props.schema)

const MAIN_GROUPS = [
  {
    label: '查询',
    value: 'search',
    children: null
  },
  {
    label: '工具栏',
    value: 'toolbar',
    children: null
  },
  {
    label: '表格',
    value: 'table',
    children: [
      {
        label: '基础',
        value: 'basic',
        children: null
      },
      {
        label: '列表项',
        value: 'columns',
        children: null
      }
    ]
  }
]
// 当前选中-主级
const mainActive = ref('')
// 当前选中-次级
const subMainActive = ref('')
// 设置区域模块树-主级
const mainGroups = ref<null | any[]>(null)
// 设置区域模块树-次级
const subMainGroup = ref<null | any[]>(null)
// 可拖拽区域
const groupName = ref('')

onMounted(() => {
  mainGroups.value = MAIN_GROUPS
  mainActive.value = mainGroups.value?.[0]?.value
})

watch(
  () => mainActive.value,
  val => {
    subMainGroup.value = mainGroups.value?.filter(group => group.value === val)?.[0]?.children
    subMainActive.value = subMainGroup.value?.[0]?.value

    groupName.value = val + (subMainGroup.value ? `_${subMainActive.value}` : '')

    emit('drag-group', groupName.value)
  },
  { immediate: true }
)

watch(
  () => subMainActive.value,
  val => {
    groupName.value = mainActive.value + (subMainGroup.value ? `_${val}` : '')

    emit('drag-group', groupName.value)
  },
  { immediate: true }
)
</script>

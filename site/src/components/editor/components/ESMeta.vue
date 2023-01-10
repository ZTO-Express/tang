<!-- 编辑区域-元组件（可拖拽） -->
<template>
  <div class="setting-add-wrap">
    <VueDraggable
      class="drag-wrap"
      :list="lists"
      :sort="false"
      :group="{ name: groupName, pull: 'clone', put: false }"
      :clone="handleClone"
      item-key="id"
    >
      <template #item="{ element }">
        <div class="item">
          {{ element.label }}
        </div>
      </template>
    </VueDraggable>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from '@zto/zpage'
import VueDraggable from 'vuedraggable'

const props = defineProps<{
  // items: any
  groupName: string
}>()

// const items = reactive<any>(props.items)

const commonOptions = {
  opWorkOrderTypes: [
    { label: '巡检类', value: 1 },
    { label: '客服类', value: 2 },
    { label: '商业类', value: 3 },
    { label: '运营类', value: 4 },
    { label: '舆情类', value: 5 },
    { label: '其他类', value: 6 }
  ]
}

function addDialog() {
  return {
    width: 600,
    labelWidth: 100,
    itemSpan: 24,

    formItems: [
      { label: '工单名称', type: 'input', prop: 'title' },
      { label: '工单编号', type: 'input', prop: 'workOrderCode' },
      { label: '工单类型', type: 'select', prop: 'type', options: [...commonOptions.opWorkOrderTypes] },
      {
        label: '创建时间',
        type: 'date-range-picker',
        prop: 'startTime',
        toProp: 'endTime',
        defaultTo: 'now',
        defaultRange: 30
      }
    ]
  }
}

// vuedraggable的:sort="false"有bug
// 用常量数据，则在本区域内拖拽不生效
const FormLists = [
  {
    value: 'input',
    label: '文本输入',
    settings: { label: '输入框组件', type: 'input', prop: 'name', span: 12 }
  },
  {
    value: 'select',
    label: '选择器',
    settings: {
      label: '下拉框组件',
      type: 'select',
      prop: 'type',
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 }
      ],
      span: 12
    }
  },
  {
    value: 'date-range-picker',
    label: '日期选择',
    settings: {
      label: '日期组件',
      type: 'date-range-picker',
      prop: 'startTime',
      toProp: 'endTime',
      defaultTo: 'now',
      defaultRange: 30,
      span: 12
    }
  }
]

const ActionLists = [
  {
    // value: 'date-range-picker',
    label: '弹框',
    settings: {
      action: 'add',
      label: '操作1',
      api: 'kdcs.addRiskStore',
      // perm: 'kdcs.addRiskStore',
      dialog: addDialog()
    }
  },
  {
    // value: 'date-range-picker',
    label: '链接',
    settings: {
      action: 'link',
      label: '详情',
      link: {
        title: '工单详情（${data.row.workOrderCode}）',
        name: 'kt.operate.task.workorder.detail',
        path: '/operate/task/workorder/detail'
        // query: {
        //   id: '${data.row.id}'
        // }
      }
    }
  }
]

const ExportLists = [
  {
    // value: 'date-range-picker',
    label: '导出',
    settings: {
      action: 'export',
      label: '导出全部',
      api: 'base.addExportTask',
      searchParamProp: 'parameter',
      // exportType: 'wokrOrderList',
      apiParams: {
        exportType: 'wokrOrderList',
        remark: ''
      },
      exSearchParams: {
        pageIndex: 1,
        pageSize: 1000000
      }
      // perm: 'wokrOrderList'
    }
  }
]

const ColumnLists = [
  {
    label: '表格列',
    settings: {
      label: '表格列名称',
      prop: 'name',
      width: 100,
      minWidth: ''
    }
  }
]

const GroupNameMap = {
  search: FormLists,
  toolbar: [...ActionLists, ...ExportLists],
  table_basic: ActionLists,
  table_columns: ColumnLists,
  dialog_form: FormLists
}

const lists = ref<any>([])

watch(
  () => props.groupName,
  val => {
    lists.value = GroupNameMap[val as keyof typeof GroupNameMap]
  },
  { immediate: true }
)

const handleClone = (val: any) => ({ ...val.settings })
</script>

<style lang="scss" scoped>
.setting-add-wrap {
  border-right: 1px solid #eee;
  // border-radius: 4px;
  // padding: 4px;
  // width: 90px;
  flex: 0 0 90px;

  .drag-wrap {
    display: flex;
    flex-direction: column;

    .item {
      padding: 4px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        cursor: move;
        background: #ccc;
      }
    }
  }
}
</style>

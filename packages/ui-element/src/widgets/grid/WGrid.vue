<template>
  <div class="w-grid" v-bind="innerAttrs.grid">
    <template v-if="isRowGrid">
      <el-row
        v-for="(it, index) in gridRows"
        :key="index"
        v-bind="innerAttrs.row"
        :gutter="innerAttrs.row?.gutter || 10"
      >
        <el-col :span="24" v-bind="innerAttrs.col">
          <widget :schema="it"></widget>
        </el-col>
      </el-row>
    </template>
    <template v-else>
      <el-row :gutter="innerAttrs.row?.gutter || 10" v-bind="innerAttrs.row">
        <el-col
          v-for="(it, index) in gridCols"
          :key="index"
          v-bind="{ ...innerAttrs.col, ...it.colAttrs }"
          :span="it.colSpan || innerAttrs.col?.span"
        >
          <widget :schema="it"></widget>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
import { useCurrentAppInstance } from '@zto/zpage'

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const app = useCurrentAppInstance()

const wSchema = app.useWidgetSchema(props.schema)

const gridRows = wSchema.rows || []
const gridCols = wSchema.cols || []
const innerAttrs = wSchema.innerAttrs || {}

const isRowGrid = !!gridRows?.length
</script>

<style lang="scss" scoped>
.w-grid {
  overflow-x: hidden;
}
</style>

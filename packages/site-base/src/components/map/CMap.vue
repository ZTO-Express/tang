<template>
  <el-dialog
    :model-value="isShowMap"
    v-bind="dialogAttrs"
    custom-class="c-map"
    :close-on-click-modal="false"
    :append-to-body="true"
    title="查看位置"
    top="10vh"
    @close="handleDialogClose"
    @opened="handleDialogOpen"
  >
    <div id="mapContainer"></div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, useCurrentAppInstance } from '@zto/zpage'
import mapUtil from '../../utils/map'

const props = withDefaults(
  defineProps<{
    isShowMap?: boolean // 是否显示弹窗
    lnglat?: string //经纬度字符串
    innerAttrs?: Record<string, any> // 内部元素属性
  }>(),
  {
    lnglat: ''
  }
)

const app = useCurrentAppInstance()

const { Message } = app.useMessage()

const emit = defineEmits(['update:isShowMap'])

const dialogAttrs = computed(() => {
  const dialogAttrs = { ...props.innerAttrs?.dialog }
  return dialogAttrs
})

onMounted(() => {
  mapUtil.init()
})

function handleDialogClose() {
  //关闭弹窗
  emit('update:isShowMap', false)
}

function handleDialogOpen() {
  //打开弹窗
  if (props.lnglat) {
    const lnglatData = props.lnglat.split(',').map(item => Number(item))

    nextTick(() => {
      renderMap(lnglatData)
    })
  } else {
    Message.warning('未传入经纬度！')
  }
}

function renderMap(lnglat: any[]) {
  //地图渲染
  const map = new window.BMapGL.Map('mapContainer')
  const point = new window.BMapGL.Point(lnglat[0], lnglat[1])

  map.centerAndZoom(point, 14)
  map.enableScrollWheelZoom(true)
  map.addOverlay(new window.BMapGL.Marker(point))
}
</script>

<style lang="scss">
.c-map {
  .el-dialog__body {
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
#mapContainer {
  width: 100%;
  height: 70vh;
  display: block;
  overflow: hidden;
}
</style>

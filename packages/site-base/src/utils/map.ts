import { loadScript, useCurrentAppInstance } from '@zto/zpage'

import type { GenericFunction } from '@zto/zpage'

export interface BMapInstance {
  removeOverlay: GenericFunction
  getOverlays: GenericFunction
  centerAndZoom: GenericFunction
  addOverlay: GenericFunction
}

export const BMAP_API = '//api.map.baidu.com'
export const MARKERS_IMAGE = `/images/icons/markers.png`

export enum MARKER_TYPE {
  RED_A = 'red_a',
  RED_B = 'red_b',
  RED_C = 'red_c',
  RED_D = 'red_d',
  RED_E = 'red_e',
  RED_F = 'red_f',
  RED_G = 'red_g',
  RED_H = 'red_h',
  RED_I = 'red_i',
  RED_J = 'red_j',
  BLUE_DOWN = 'blue_down',
  RED = 'red',
  ORANGE = 'orange'
}

export const MARKERS_IMAGE_OFFSET: Record<MARKER_TYPE, [number, number]> = Object.freeze({
  [MARKER_TYPE.RED_A]: [0, 0],
  [MARKER_TYPE.RED_B]: [0, 1],
  [MARKER_TYPE.RED_C]: [0, 2],
  [MARKER_TYPE.RED_D]: [0, 3],
  [MARKER_TYPE.RED_E]: [0, 4],
  [MARKER_TYPE.RED_F]: [0, 5],
  [MARKER_TYPE.RED_G]: [0, 6],
  [MARKER_TYPE.RED_H]: [0, 7],
  [MARKER_TYPE.RED_I]: [0, 8],
  [MARKER_TYPE.RED_J]: [0, 9],
  [MARKER_TYPE.BLUE_DOWN]: [0, 10],
  [MARKER_TYPE.RED]: [0, 11],
  [MARKER_TYPE.ORANGE]: [0, 12]
})

/** 初始化地图 */
export function checkLoad() {
  return new Promise(async (resolve, reject) => {
    const app = useCurrentAppInstance(true)

    const env = app.env

    const BMap_URL = `${BMAP_API}/api?v=2.0&ak=${env.bmapAK}&callback=onBMapCallback`

    if (!window.BMap) {
      await loadScript(BMap_URL)
    } else {
      resolve(window.BMap)
      return true
    }

    // 百度地图异步加载回调处理
    window.onBMapCallback = function () {
      console.log('百度地图脚本初始化成功...')

      setTimeout(() => {
        resolve(window.BMap)
      }, 500)
    }
  })
}

/** 清除所有标记 */
export function clearAllMarker(mapInstance: BMapInstance) {
  const allOverlay = mapInstance.getOverlays()

  for (let j = 0; j < allOverlay.length; j++) {
    if (allOverlay[j].toString() === '[object Marker]') {
      mapInstance.removeOverlay(allOverlay[j])
    }
  }
}

/** 加载查询 */
export function localSearch(mapInstance: BMapInstance, keyword: string) {
  return new Promise((resolve, reject) => {
    let local: any

    const options = {
      onSearchComplete: function (results: any) {
        // 判断状态是否正确
        if (local.getStatus() === window.BMAP_STATUS_SUCCESS) {
          var resultList: any[] = []
          for (var i = 0; i < results.getCurrentNumPois(); i++) {
            resultList.push(results.getPoi(i))
          }

          resolve(resultList)
        } else {
          reject([])
        }
      }
    }

    local = new window.BMap.LocalSearch(mapInstance, options)
    local.search(keyword)
  })
}
// 添加一个标记覆盖物
export function addMarker(mapInstance: BMapInstance, { lng, lat, title }: any, dragable: boolean = false) {
  const point = new window.BMap.Point(lng, lat)
  mapInstance.centerAndZoom(point, 17)
  const marker = new window.BMap.Marker(point) // 创建标注
  mapInstance.addOverlay(marker) // 将标注添加到地图中

  title = title || '位置'
  const label = new window.BMap.Label(title, { offset: new window.BMap.Size(-50, -20) })
  marker.setLabel(label)

  if (dragable) marker.enableDragging()

  return marker
}

// 根据位置获取地址
export function getAddressByLocation({ lng, lat }: any) {
  const point = new window.BMap.Point(lng, lat)
  const gc = new window.BMap.Geocoder()

  return new Promise((resolve, reject) => {
    gc.getLocation(point, (rs: any) => resolve(rs))
  })
}

/** 获取标记Icon */
export function getMarkerMapIcon(markerType: MARKER_TYPE = MARKER_TYPE.RED) {
  let iconOffset = MARKERS_IMAGE_OFFSET[markerType]

  const icon = new window.BMap.Icon(MARKERS_IMAGE, new window.BMap.Size(23, 25), {
    offset: new window.BMap.Size(iconOffset[0] * 20, 25), // 指定定位位置
    imageOffset: new window.BMap.Size(iconOffset[0] * 20, 0 - iconOffset[1] * 25) // 设置图片偏移
  })

  return icon
}

/** 获取标记Icon雪碧图 */
export function getMarkerIconSprite(markerType: MARKER_TYPE = MARKER_TYPE.RED) {
  let iconOffset = MARKERS_IMAGE_OFFSET[markerType]

  const left = `${iconOffset[0] * 20}px`
  const top = `${-1 * iconOffset[1] * 25}px`

  return {
    width: '23px',
    height: '25px',
    background: `url(${MARKERS_IMAGE}) ${left} ${top} no-repeat`
  }
}

export default {
  init: checkLoad,
  clearAllMarker,
  localSearch,
  addMarker,
  getAddressByLocation
}

/* eslint-disable vue/multi-word-component-names */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  defineComponent,
  unref,
  shallowRef,
  toRefs,
  watch,
  computed,
  inject,
  onMounted,
  onUnmounted,
  h,
  nextTick,
  PropType,
  watchEffect
} from '@zto/zpage'
import { init as initChart } from 'echarts/core'
import {
  EChartsType,
  Option,
  Theme,
  ThemeInjection,
  InitOptions,
  InitOptionsInjection,
  UpdateOptions,
  UpdateOptionsInjection
} from './types'
import { usePublicAPI, useAutoresize, autoresizeProps, useLoading, loadingProps } from './composables'
import './style.css'
import { omitOn } from '../utils'

const TAG_NAME = 'x-vue-echarts'

export const THEME_KEY = 'ecTheme'
export const INIT_OPTIONS_KEY = 'ecInitOptions'
export const UPDATE_OPTIONS_KEY = 'ecUpdateOptions'
export { LOADING_OPTIONS_KEY } from './composables'

export default defineComponent({
  name: 'echarts',
  props: {
    option: Object as PropType<Option>,
    theme: {
      type: [Object, String] as PropType<Theme>
    },
    initOptions: Object as PropType<InitOptions>,
    updateOptions: Object as PropType<UpdateOptions>,
    group: String,
    manualUpdate: Boolean,
    ...autoresizeProps,
    ...loadingProps
  },
  inheritAttrs: false,
  // @ts-expect-error listeners for Vue 2 compatibility
  setup(props, { attrs, listeners }) {
    const root = shallowRef<HTMLElement>()
    const chart = shallowRef<EChartsType>()
    const manualOption = shallowRef<Option>()
    const defaultTheme = inject(THEME_KEY, null) as ThemeInjection
    const defaultInitOptions = inject(INIT_OPTIONS_KEY, null) as InitOptionsInjection
    const defaultUpdateOptions = inject(UPDATE_OPTIONS_KEY, null) as UpdateOptionsInjection

    const { autoresize, manualUpdate, loading, loadingOptions } = toRefs(props)

    const realOption = computed(() => manualOption.value || props.option || null)
    const realTheme = computed(() => props.theme || unref(defaultTheme) || {})
    const realInitOptions = computed(() => props.initOptions || unref(defaultInitOptions) || {})
    const realUpdateOptions = computed(() => props.updateOptions || unref(defaultUpdateOptions) || {})
    const nonEventAttrs = computed(() => omitOn(attrs))

    function init(option?: Option) {
      if (!root.value) {
        return
      }

      const instance = (chart.value = initChart(root.value, realTheme.value, realInitOptions.value))

      if (props.group) {
        instance.group = props.group
      }

      let realListeners = listeners
      if (!realListeners) {
        realListeners = {}

        Object.keys(attrs)
          .filter(key => key.indexOf('on') === 0 && key.length > 2)
          .forEach(key => {
            // onClick    -> c + lick
            // onZr:click -> z + r:click
            const event = key.charAt(2).toLowerCase() + key.slice(3)
            realListeners[event] = attrs[key]
          })
      }

      Object.keys(realListeners).forEach(key => {
        const handler = realListeners[key] as any

        if (!handler) {
          return
        }

        if (key.indexOf('zr:') === 0) {
          instance.getZr().on(key.slice(3).toLowerCase(), handler)
        } else {
          instance.on(key.toLowerCase(), handler)
        }
      })

      function resize() {
        if (instance && !instance.isDisposed()) {
          instance.resize()
        }
      }

      function commit() {
        const opt = option || realOption.value
        if (opt) {
          instance.setOption(opt, realUpdateOptions.value)
        }
      }

      if (autoresize.value) {
        // Try to make chart fit to container in case container size
        // is changed synchronously or in already queued microtasks
        nextTick(() => {
          resize()
          commit()
        })
      } else {
        commit()
      }
    }

    function setOption(option: Option, updateOptions?: UpdateOptions) {
      if (props.manualUpdate) {
        manualOption.value = option
      }

      if (!chart.value) {
        init(option)
      } else {
        chart.value.setOption(option, updateOptions || {})
      }
    }

    function cleanup() {
      if (chart.value) {
        chart.value.dispose()
        chart.value = undefined
      }
    }

    let unwatchOption: (() => void) | null = null
    watch(
      manualUpdate,
      manualUpdate => {
        if (typeof unwatchOption === 'function') {
          unwatchOption()
          unwatchOption = null
        }

        if (!manualUpdate) {
          unwatchOption = watch(
            () => props.option,
            (option, oldOption) => {
              if (!option) {
                return
              }
              if (!chart.value) {
                init()
              } else {
                chart.value.setOption(option, {
                  notMerge: option.value !== oldOption?.value,
                  ...realUpdateOptions.value
                })
              }
            },
            { deep: true }
          )
        }
      },
      {
        immediate: true
      }
    )

    watch(
      [realTheme, realInitOptions],
      () => {
        cleanup()
        init()
      },
      {
        deep: true
      }
    )

    watchEffect(() => {
      if (props.group && chart.value) {
        chart.value.group = props.group
      }
    })

    const publicApi = usePublicAPI(chart)

    useLoading(chart, loading, loadingOptions)

    useAutoresize(chart, autoresize, root)

    onMounted(() => {
      init()
    })

    onUnmounted(cleanup)

    return {
      chart,
      root,
      setOption,
      nonEventAttrs,
      ...publicApi
    }
  },
  render() {
    const attrs = { ...this.nonEventAttrs }
    attrs.ref = 'root'
    attrs.class = attrs.class ? ['echarts'].concat(attrs.class) : 'echarts'
    return h(TAG_NAME, attrs)
  }
})

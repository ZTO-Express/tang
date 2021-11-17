/* eslint-disable indent */
import { defineComponent, computed, h, Transition, KeepAlive, Suspense } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore } from '../store'

export default defineComponent({
  setup() {
    const store = useAppStore()

    const cachedPageKeys = computed(() => {
      const keys = store.getters.visitedPages.map((it: any) => it.key)
      return keys
    })

    return () =>
      h(
        'div',
        {
          class: 'c-app fs'
        },
        h(RouterView, ({ Component }: any) =>
          !Component
            ? h('div')
            : h(Transition, { mode: 'out-in' }, () =>
                h(
                  KeepAlive,
                  {
                    'keep-alive-props': {
                      include: cachedPageKeys
                    }
                  },
                  h(
                    Suspense,
                    {},
                    {
                      default: () => h(Component),
                      fallback: () => h('div', {}, '加载中...')
                    }
                  )
                )
              )
        )
      )
  }
})

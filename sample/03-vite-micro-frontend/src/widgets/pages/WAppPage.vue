<template>
  <c-page class="w-app-page">
    <template #header>
      <c-page-header :title="wSchema.title">
        <template #extra>
          <el-form ref="form" label-width="100px">
            <el-form-item class="app-selector-item" label="当前应用">
              <c-fuzzy-select
                :model-value="currentApp?.appCode"
                :model-label="currentApp?.appName"
                trigger-focus
                placeholder="请选择应用"
                :remote-method="fetchApps"
                @change="handleAppSelectChange"
              />
            </el-form-item>
          </el-form>
        </template>
      </c-page-header>
    </template>
    <div class="w-app-page__body">
      <slot />
    </div>
  </c-page>
</template>

<script setup lang="ts">
import { vue } from '@zto/zpage'
import { useAppStore, emitter, useWidgetSchema, useApi } from '@zto/zpage-ui-element'

import { GLOBAL_EVENTS } from '@/consts'

const { computed, watch, onMounted } = vue

const store = useAppStore()
const appApi = useApi('app')

// 属性
const props = defineProps<{
  schema: Record<string, any>
}>()

const wSchema = useWidgetSchema(props.schema)

const currentApp = computed(() => {
  return store.getters.app?.currentApp
})

watch(
  () => currentApp.value,
  async () => {
    if (currentApp.value?.appCode) {
      emitter.emit(GLOBAL_EVENTS.CURRENT_APP_CHANGE, currentApp.value)
    }
  }
)

onMounted(() => {
  fetchApps()
})

/**
 * 切换应用
 */
function handleAppSelectChange(payload: any) {
  const option = payload?.option
  if (!option) return

  if (currentApp.value?.appCode === option.code) {
    return
  }

  setCurrentApp({
    appCode: option.code,
    appName: option.name
  })
}

/** 获取当前应用 */
async function fetchApps() {
  const apps: any[] = await appApi.getAppList()

  if (apps.length && !apps.some(it => it.code === currentApp.value?.appCode)) {
    const app = apps[0]

    setCurrentApp({
      appCode: app.appCode,
      appName: app.appName
    })
  }

  return apps
}

/**
 * 设置当前应用
 */
function setCurrentApp(payload: any) {
  const { appCode, appName } = payload || {}

  if (!appCode || !appName) return

  const currentApp = { appCode, appName }
  store.commit('app/setAppStates', { currentApp })

  return currentApp
}
</script>

<style lang="scss" scoped>
.w-app-page {
  &__header {
    background: white;
    padding: 10px;
  }

  &__body {
    height: 100%;
  }
}

.app-selector-item {
  margin: 5px;
}
</style>
